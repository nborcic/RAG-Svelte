<script>
	import savedMessages from '$lib/savedMessages.json';
	import { tick } from 'svelte';

	let message = '';

	let statusColor = 'bg-green-500';
	async function askAI() {
		if (!message) return;
		statusColor = 'bg-yellow-500';
		await new Promise((resolve) => setTimeout(resolve, 1000)); 

		try {
			const res = await fetch('/api/rag', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message })
			});

			await new Promise((resolve) => setTimeout(resolve, 1000)); 

			if (res.ok) {
				statusColor = 'bg-green-500';
			} else {
				statusColor = 'bg-red-500';
			}
		} catch (error) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			statusColor = 'bg-red-500';
		}
	}
</script>

<div class="mx-auto mt-8 flex max-w-[1440px] flex-col items-center justify-center">
	<main class="flex w-full flex-col rounded-xl bg-gray-100 p-4 shadow-2xl">
		<header class="mx-auto w-full max-w-3xl border-b p-4">
			<h1 class="p-2 text-4xl font-bold">RAG Chat</h1>
		</header>
		<section class="p-4">
			<li class=" my-4 flex flex-row items-center justify-center rounded-xl p-4 shadow-xl">
				<div class="h-[20%] w-[20%]">
					<label for="pdfImage" class="sr-only"></label>
					<!-- add pictures to represent file extensions -->
					<img
						id="pdfImage"
						src="https://fakeimg.pl/100x100/faf2f2/909090?text=placeholder"
						alt="placeholder avatar"
						class="h-24 w-28 rounded-xl shadow-xl"
					/>
				</div>
			</li>
			<form
				on:submit|preventDefault={askAI}
				class="mx-auto flex w-full max-w-[1440px] flex-col items-center"
			>
				<div class="flex w-full flex-row">
					<input
						class="h-[4rem] w-full rounded-xl border-none bg-white p-2 text-xl shadow-xl"
						placeholder="Ask away..."
						type="text"
						name="inputName"
						required
						bind:value={message}
					/>

					<button
						type="submit"
						class="ml-2 h-[4rem] w-[7rem] rounded-xl border border-gray-200 p-2 shadow-xl hover:bg-gray-200"
					>
						Send
					</button>
				</div>
				<div class="mt-4 flex gap-4">
					<div class="h-4 w-4 rounded-full {statusColor} transition-all duration-500"></div>
				</div>
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
		</section>
	</main>
</div>
