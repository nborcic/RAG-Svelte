import { json } from '@sveltejs/kit';
import { Ollama } from '@langchain/community/llms/ollama';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import savedMessages from '$lib/savedMessages.json';



dotenv.config();

const model = new Ollama({ model: 'llama2', baseUrl: process.env.LLAMA2_URL });

const getFilesFromFolder = async (folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    console.log(`Files found in folder: ${files}`);
    return files.map((file) => path.join(folderPath, file));
  } catch (error) {
    console.error('Error reading folder:', error);
    return [];
  }
};

const loadPDF = async (pdfPath) => {
  try {
    const loader = new PDFLoader(pdfPath);
    return await loader.load();
  } catch (error) {
    console.error(`Error loading PDF (${pdfPath}):`, error);
    return [];
  }
};

const loadText = async (textPath) => {
  try {
    const textContent = await fs.readFile(textPath, 'utf-8');
    return [{ pageContent: textContent }];
  } catch (error) {
    console.error(`Error loading text file (${textPath}):`, error);
    return [];
  }
};

const processFolder = async (folderPath) => {
  const files = await getFilesFromFolder(folderPath);
  let documents = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    console.log(`Processing file: ${file}`);

    let loadedDocs = [];
    if (ext === '.pdf') {
      loadedDocs = await loadPDF(file);
    } else if (ext === '.txt') {
      loadedDocs = await loadText(file);
    }


    const docsWithMetadata = loadedDocs.map((doc, index) => ({
      pageContent: doc.pageContent,
      metadata: {
        source: file,
        index,
      },
    }));

    documents.push(...docsWithMetadata);
  }

  return documents;
};

const splitText = async (documents) => {
  try {
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error("Documents array is empty or invalid.");
    }


    documents.forEach((doc, index) => {
      if (!doc.pageContent) {
        console.error(`Document at index ${index} is missing 'pageContent':`, doc);
      }
    });

    const splitter = new CharacterTextSplitter({
      separator: '. ',
      chunkSize: 2500,
      chunkOverlap: 200
    });


    return await splitter.splitDocuments(documents);
  } catch (error) {
    console.error('Error splitting documents:', error);
    return [];
  }
};


const createVectorStore = async (chunks) => {
  try {
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('Creating vector store with chunks:', chunks.length);
    return await MemoryVectorStore.fromDocuments(chunks, embeddings);
  } catch (error) {
    console.error('Error creating vector store:', error);
    return null;
  }
};

export async function POST({ request }) {
  if (!request) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!request.headers.get('content-type').includes('application/json')) {
    return json({ error: 'Invalid content type' }, { status: 400 });
  }




  try {
    const body = await request.json();
    const { message } = body;
    const folderPath = './static/documents';
    const userMessage = {
      role: "USER",
      content: message,
    };
    savedMessages.push(userMessage);
    fs.writeFile('src/lib/savedMessages.json', JSON.stringify(savedMessages));

    // 1. Process documents from folder
    const documents = await processFolder(folderPath);
    if (documents.length === 0) {
      return json({ error: 'No valid documents found' }, { status: 400 });
    }

    // 2. Split documents into chunks
    const chunks = await splitText(documents);
    if (chunks.length === 0) {
      return json({ error: 'Failed to process text' }, { status: 500 });
    }

    // 3. Create vector store from chunks
    const vectorStore = await createVectorStore(chunks);
    if (!vectorStore) {
      return json({ error: 'Vector store creation failed' }, { status: 500 });
    }

    // 4. Perform similarity search
    const results = await vectorStore.similaritySearch(message, 2);
    const context = results.map((r) => r.pageContent).join('\n');

    // 5. Generate response using the AI model
    const response = await model.invoke(`message: ${message}\nContext: ${context}`);
    //create new obj for gpt response
    if (response) {
      const gptResponse = {
        role: "GPT",
        content: response,
      };
      //push gpt response to savedMessages
      savedMessages.push(gptResponse);
      //add gpt response to savedMessages.json
      fs.writeFile('src/lib/savedMessages.json', JSON.stringify(savedMessages));
    }

    return Response({ status: 200 })
  } catch (error) {
    console.error('Error in RAG system:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
