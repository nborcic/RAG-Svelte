
// import { MemoryVectorStore } from 'langchain/vectorstores/memory';
// import { OpenAIEmbeddings } from '@langchain/openai';
// import { CharacterTextSplitter } from 'langchain/text_splitter';
// import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
// import fs from 'fs/promises';
// import path from 'path';
// import dotenv from 'dotenv';


// import savedMessages from '$lib/savedMessages.json';
// import fs from 'fs';
// import path from 'path';
// dotenv.config();
// const messagesFilePath = path.resolve('src/lib/savedMessages.json');

// export const actions = {
//     default: async ({ request }) => {
//         try {
//             const data = await request.formData();
//             const inputName = data.get('inputName');

//             const existingMessages = fs.readFileSync(path.resolve('src/lib/savedMessages.json'), 'utf8');
//             const parsedMessages = JSON.parse(existingMessages);

//             parsedMessages.push({ "role": "user", "message": inputName });
//             fs.writeFileSync(path.resolve('src/lib/savedMessages.json'), JSON.stringify(parsedMessages, null, 2));


//             const chatModel = new ChatOllama({
//                 baseUrl: "http://localhost:11434", //Locally hosted Docker container
//                 model: "mistral",
//             });
//             const loader = new DirectoryLoader(
//                 "src/lib/api/FilesFolder/",
//                 {
//                     ".json": (path) => new JSONLoader(path, "/texts"),
//                     ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
//                     ".txt": (path) => new TextLoader(path),
//                     ".csv": (path) => new CSVLoader(path, "text"),
//                 }
//             );
//             const docs = await loader.load();
//             console.log({ docs });
//             //parsedMessages.push({ "role": "ollama", "message": response });
//             // fs.writeFileSync(path.resolve('src/lib/savedMessages.json'), JSON.stringify(parsedMessages, null, 2));





//         } catch (error) {
//             console.error('Error processing form data:', error);
//         }

//     }

// };


