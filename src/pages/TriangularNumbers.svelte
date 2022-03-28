<script>
  const triangular = (number) => {
    const abs = Math.abs(number);
    return (abs / 2) * (abs + 1) * (abs / number) || 0;
  };

  export let triangularHighlight = {}
  const numbers = 50;
  let numberArray = [];
  for (let index = 1; index < numbers; index++) {
    const triangleNum = triangular(index)
    numberArray.push(triangleNum);
    triangularHighlight[triangleNum] = true;
  }
  let number='';

    const toggleHighlight = num => {
    triangularHighlight[num] = !triangularHighlight[num]
  }
  
</script>

<div class="numberbar">
  <div>Triangular Numbers 
    <button class="border-2 rounded-xl my-0.5 bg-gray-200 px-2 hover:scale-110 " on:click={() => {
    for (const val in triangularHighlight) {triangularHighlight[val] = false}
  }}>clear</button>
  <button class="border-2 rounded-xl my-0.5 bg-gray-200 px-2 hover:scale-110" on:click={() => {
    for (const val in triangularHighlight) {triangularHighlight[val] = true}
  }}>select all</button>
   
  </div>
  <table class="border-solid border-2">
    <thead>
      <tr class="border-solid border-2">
        {#each numberArray as triangularNumber, i}
          <td class="border-solid border-2">{i+1}</td>
        {/each}
      

</tr>
  {#each numberArray as triangularNumber, i}
  <td class="border-2 px-2">
    <a href="" bind:innerHTML={triangularNumber} contenteditable 
    class:triangularhighlight={triangularHighlight[triangularNumber]}
    on:click|preventDefault={() => toggleHighlight(triangularNumber)}>
      {triangularNumber} &nbsp;
    </a>
    </td>
{/each}
</thead>
</table>
</div>

<style>
  a {
    cursor: pointer;
  }
  .numberbar {
    margin: 0px;
    width: 100%;
    background-color: lightblue;
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    }

    .triangularhighlight {
		color: yellow;
		background-color: red;
		font-style: italic;
		font-weight: bold;
	}

  table, td {
    border-style: solid;
    text-align: center;
    border-collapse: collapse;
    padding: 0.5vh;
  }

</style>
