<script>
	import Decoder from "./pages/Decoder.svelte";
	export let focussed;
</script>

<!-- {"cipherName":"English Ordinal",
"cipherCategory":"English",
"H":120,"S":65,"L":62,
"cArr":[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
"vArr":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
"diacriticsAsRegular":true,
"caseSensitive":false,"enabled":true,"cp":[],"cv":[],"sumArr":[]} -->

<nav>
	<h5>Decoder by Tony 201</h5>
	<a href='https://github.com/sir-tonytiger-201/decoder'>GitHub Page</a>
	<Decoder bind:focussed />
	<a href='https://hangulkeyboard.vercel.app/'
	>My other web app: 한글 Keyboard</a>
</nav>

<main />

<style>
	a, span {
		float: right;
		margin: 1em;
	}


	h5 {
		color: blue;
		text-shadow: 4px 4px 2px rgb(212, 27, 172);
		position: absolute;
		margin-left: 2em;
		vertical-align: top;
	}
	main {
		clear: right;
		text-align: center;
		padding: 0;
		max-width: 240px;
		margin: 0;
	}

	nav {
		clear: right;
		padding-bottom: 1em;
	}
	
	

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.highlight {
		color: yellow;
		background-color: red;
		font-style: oblique;
	}

	div {
		clear: both;
		padding-top: 0px;
		margin-top: 0px;
	}
</style>
