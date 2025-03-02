<script>
	import savedMessages from '$lib/savedMessages.json';

	let input = '';
	let messages = [];
	let question = '';
	let answer = '';

	async function askAI() {
		answer = 'Loading...';
		const res = await fetch('/api/rag', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ question })
		});

		const data = await res.json();
		answer = data.answer || 'Error retrieving answerR';
	}
</script>

<div class="mx-auto flex max-w-[1440px] flex-col items-center justify-center">
	<main class="flex w-full flex-col bg-gray-100">
		<header class="mx-auto w-full max-w-3xl border-b p-4">
			<h1 class="p-2 text-4xl font-bold">RAG Chat</h1>
		</header>
		<section class="p-4">
			<li class=" my-4 flex flex-row items-center justify-center rounded-xl p-4 shadow-xl">
				<div class="h-[20%] w-[20%]">
					<label for="pdfImage" class="sr-only"></label>
					<img
						id="pdfImage"
						src="https://avatar.iran.liara.run/public"
						alt="placeholder avatar"
						class="h-24 w-28 rounded-xl shadow-xl"
					/>
				</div>
			</li>
			<form class="mx-auto flex w-full max-w-[1440px] items-center">
				<input
					class="h-[4rem] w-full rounded-xl border-none bg-white p-2 text-xl shadow-xl"
					placeholder="Ask away..."
					type="text"
					name="inputName"
					required
					bind:value={question}
				/>
				<button
					on:click={askAI}
					class="ml-2 h-[4rem] w-[7rem] rounded-xl border border-gray-200 p-2 shadow-xl hover:bg-gray-200"
					type="submit"
				>
					Send
				</button>
			</form>
		</section>
		<section>
			{#if savedMessages.length === 0}
				<p class="text-center text-lg">No messages yet</p>
			{/if}
			{#if savedMessages && savedMessages.length > 0}
				<section class="container mx-auto flex">
					<ul class="flex flex-grow flex-col gap-4 overflow-y-auto rounded-lg p-4">
						{#each savedMessages as msg}
							<p class="underline">{msg.role}</p>
							<p>{msg.content}</p>
						{/each}
					</ul>
				</section>
			{/if}
			{#if answer}
				<p class="mt-4 rounded bg-gray-100 p-3">AI: {answer}</p>
			{/if}
		</section>
	</main>
</div>
