// =========================== Export CSV ===========================

var dragCounter = 0 // Firefox fix
$(document).ready(function(){
	// change element style on drag-enter event
	$("body").on("dragenter", "#phraseBox", function () {
		dragCounter++
		$(this).addClass("dragOver");
	});
	$("body").on("dragleave", "#phraseBox", function () {
		dragCounter--
		if (dragCounter == 0) $(this).removeClass("dragOver");
	});
});

function dropHandler(ev) {
	// console.log('File(s) dropped')
	dragCounter = 0 // reset counter
	$("#phraseBox").removeClass("dragOver")
	
	ev.preventDefault() // prevent default behavior (Prevent file from being opened)

	if (ev.dataTransfer.items) {
		// use DataTransferItemList interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.items.length; i++) {
			// if dropped items aren't files, reject them
			if (ev.dataTransfer.items[i].kind === 'file') {
				var file = ev.dataTransfer.items[i].getAsFile()
				console.log('... "FILE" file[' + i + '].name = ' + file.name)
				//console.log(file)
				//console.log(ev)
			}
		}
	} else {
		// use DataTransfer interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.files.length; i++) {
			console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name)
		}
	}
	
	var file = ev.dataTransfer.files[0] // first file
	importFileAction(file)
}

function processDateFile(userHist) { // calculated date durations for imported file
	var t = compareDateArray(userHist) // get durations for each pair
	t = 'data:text/plain;charset=utf-8,'+encodeURIComponent(t) // format as text file
	download(getTimestamp()+"_GEMATRO_DATES.txt", t); // download file
}
	
function importFileAction(file) {
	var reader = new FileReader()
	
	var sb = "" // string builder
	reader.onload = (event) => { // actions to perform after file is read
		file = event.target.result // full file contents
		var userHist = file.split(/\r\n|\n/) // to string array, line break as separator
		
		//userHist.forEach((line) => { // print line by line
		//	console.log(line)
		//})
		
		var uCiph = [] // user saved ciphers
		uCiph = userHist[0].split(";") // table header to array (user ciphers from CSV), semicolon separator

		// detect database export mode
		if (uCiph[0] == "CREATE_GEMATRO_DB") {
			userHist.splice(0,1) // remove the first line
			if (liveDatabaseMode == false) { // precompiled database mode
				expCiphers = exportCiphersDB() // export enabled ciphers
				exportHistoryCSV(userHist, true, expCiphers) // export database with enabled ciphers
			} else {
				userDBlive = [...userHist] // live database mode
				$("#queryDBbtn").removeClass("hideValue") // display query button
				$("#clearDBqueryBtn").removeClass("hideValue") // clear button
				$("#unloadDBBtn").removeClass("hideValue") // unload database button
				$("#btn-export-db-query").removeClass("hideValue") // export button
				$("#liveDBOption").addClass("hideValue") // hide "Live Database Mode"
				closeAllOpenedMenus() // close menus

				console.log("Database loaded! ("+userDBlive.length+" entries)")
				var alertDiv = $('<div />').appendTo('body');
				alertDiv.attr('id', 'dbAlert');
				alertDiv.html("<span>Database loaded!</span>")
				setTimeout(function() {
					alertDiv.remove()
				}, 1000)
			}
			return
		}

		// detect file with dates
		if (uCiph[0] == "GEMATRO_DATES") {
			userHist.splice(0,1) // remove the first line
			processDateFile(userHist) // compare dates
			return
		}
	
		// detect cipher.js, load user ciphers
		if (uCiph[0] == "// ciphers.js") {
			optShowExtraCiphers = false // clear "Show Extra Ciphers" option
			document.getElementById('chkbox_SEC').checked = false

			if (precalcDBLoaded) { // return if precalculated database is loaded
				var alertDiv = $('<div />').appendTo('body');
				alertDiv.attr('id', 'dbAlert');
				alertDiv.html("<center><span>Cipher import for precalculated databases is disabled!</span><br><span>Unload the database first.</span></center>")
				setTimeout(function() {
					alertDiv.remove()
				}, 3000)
				return
			}
			var calcOpt = file.match(/(?<=calcOptions = \[)[^\]]+/) // array values
			importCalcOptions(calcOpt) // load user options

			var ciph = file.match(/(?<=cipherList = \[)[\s\S]+/m) // match after "cipherList = [" till end of file, multiple line regex - [\s\S]+
			file = ciph[0].replace(/(\t|  +|\r|\n)/g, "").slice(10,-1) // remove tabs, consequtive spaces, line breaks - "new cipher" at start, last bracket
			ciph = file.split(",new cipher") // split string into array

			cipherList = []; cCat = []; defaultCipherArray = [] // clear arrays with previously defined ciphers, categories, default ciphers
			for (n = 0; n < ciph.length; n++) {
				cipherList.push(eval("new cipher("+ciph[n].slice(1,-1)+")")) // remove parethesis, evaluate string as javascript code
			}
			document.getElementById("calcOptionsPanel").innerHTML = "" // clear menu panel
			initCalc() // reinit
			updateTables() // update tables
			updateInterfaceColor(true) // update interface color (first run)
			if (userDBlive.length !== 0) { // restore controls if live database is loaded
				$("#queryDBbtn").removeClass("hideValue") // display query button
				$("#clearDBqueryBtn").removeClass("hideValue") // clear button
				$("#unloadDBBtn").removeClass("hideValue") // unload database button
				$("#btn-export-db-query").removeClass("hideValue") // export button
				$("#liveDBOption").addClass("hideValue") // hide "Live Database Mode"
			}

			var alertDiv = $('<div />').appendTo('body');
			alertDiv.attr('id', 'dbAlert');
			alertDiv.html("<span>Ciphers loaded!</span>")
			setTimeout(function() {
				alertDiv.remove()
			}, 1000)
			return
		}

		// detect previously exported matches
		if ( uCiph[0] == '======= Same Cipher Match =======' || uCiph[0] == '============ Cross Cipher Match ============' ) {
			var phrMatch
			for (i = 0; i < userHist.length; i++) {
				phrMatch = userHist[i].match(/^\".+\"/) // grab phrase between a quote in the beginning and the last quote found in line (with quotes)
				if (phrMatch !== null) {
					addPhraseToHistory(phrMatch[0].slice(1,-1), false) // remove quotes, load extracted phrase (first item), false flag doesn't update history
				}
			}
			updateTables() // update tables after all lines are added
			return
		}

		// detect database import
		if ( uCiph[0] == 'GEMATRO_DB' ) {
			liveDatabaseMode = false // disable live database mode

			// import ciphers from database
			var calcOpt = file.match(/(?<=calcOptions = \[)[^\]]+/) // array values
			importCalcOptions(calcOpt) // load user options

			var ciph = file.match(/(?<=cipherList = \[)[\s\S]+/m) // match after "cipherList = [" till end of file, multiple line regex - [\s\S]+
			file = ciph[0].replace(/(\t|  +|\r|\n)/g, "").slice(10,-1) // remove tabs, consequtive spaces, line breaks - "new cipher" at start, last bracket
			ciph = file.split(",new cipher") // split string into array

			cipherList = []; cCat = []; defaultCipherArray = [] // clear arrays with previously defined ciphers, categories, default ciphers
			for (n = 0; n < ciph.length; n++) {
				cipherList.push(eval("new cipher("+ciph[n].slice(1,-1)+")")) // remove parethesis, evaluate string as javascript code
			}
			document.getElementById("calcOptionsPanel").innerHTML = "" // clear menu panel
			initCalc() // reinit
			updateTables() // update tables
			updateInterfaceColor() // update interface color

			ciphersPos = userHist.indexOf("// ciphers.js") // line number where cipher definition starts
			userDB = [] // clear previous DB
			var tmp = []
			for (i = 1; i < ciphersPos; i++) { // ignore first line (cipher names), ignore lines after "// ciphers.js"
				tmp = userHist[i].split(";") // current line to array, phrase at index 0
				// for (n = 1; n < tmp.length; n++) { tmp[n] = Number(tmp[n]) } // parse as numbers
				// it takes some 5 seconds instead of 1s, maybe better to convert number to string when search is performed
				userDB.push(tmp) // add phrase (no check for duplicates)
			}
			$("#queryDBbtn").removeClass("hideValue") // display query button
			$("#clearDBqueryBtn").removeClass("hideValue") // clear button
			$("#unloadDBBtn").removeClass("hideValue") // unload database button
			$("#btn-export-db-query").removeClass("hideValue") // export button
			$("#edCiphBtn").addClass("hideValue") // hide "Edit Ciphers"
			$("#liveDBOption").addClass("hideValue") // hide "Live Database Mode"
			closeAllOpenedMenus() // close "Edit Ciphers"
			precalcDBLoaded = true // precalculated database loaded, disable cipher rearrangement

			optShowExtraCiphers = false // disable and hide "Show Extra Ciphers" option
			document.getElementById('chkbox_SEC').checked = false
			$('#showExtraCiphOption').addClass('hideValue')

			console.log("Database loaded! ("+userDB.length+" entries)")
			var alertDiv = $('<div />').appendTo('body');
			alertDiv.attr('id', 'dbAlert');
			alertDiv.html("<span>Database loaded!</span>")
			setTimeout(function() {
				alertDiv.remove()
			}, 1000)
			return
		}

		// continue import of file as CSV history or plain text file
		if (optLoadUserHistCiphers && uCiph[0] == "Word or Phrase") { // switch to ciphers from imported CSV file
			disableAllCiphers()
			for (z = 0; z < cipherList.length; z++) { // enable cipher if it is available
				if (uCiph.indexOf(cipherList[z].cipherName) > -1) {
					cipherList[z].enabled = true
				}
			}
		}

		var uPhr = ''; var plainTxt = true
		var a = 0 // i = 0 to add all phrases, i = 1 to ignore first line (table header)
		if (uCiph[0] == "Word or Phrase") {
			a = 1  // ignore table header if present
			plainTxt = false // use substring to extract phrase from CSV later
		}

		for (i = a; i < userHist.length; i++) {
			uPhr = userHist[i] // load line, phrase with gematria
			if (!plainTxt) uPhr = uPhr.substring(0, uPhr.indexOf(';')) // CSV, get text before the first semicolon (faster)
			addPhraseToHistory(uPhr, false) // load phrase (first item), false flag doesn't update history
		}
		
		updateTables() // update tables after all lines are added
	}

	reader.onerror = (event) => {
		alert(event.target.error.name)
	};

	reader.readAsText(file) // issue command to start reading file
}

function importCalcOptions(calcOpt) { // load user options
	if (calcOpt !== null) {
		optArr = calcOpt[0].split(','); var i = 0; // split by comma, use first match
		if (typeof optArr[i] !== 'undefined') optNumCalcMethod = optArr[i]; i++;
		if (typeof optArr[i] !== 'undefined') optFiltCrossCipherMatch = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optFiltSameCipherMatch = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optShowOnlyMatching = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') compactHistoryTable = optArr[i] == "true" ? true : false; i++; // not used, compatibility
		if (typeof optArr[i] !== 'undefined') optNewPhrasesGoFirst = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optShowExtraCiphers = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optAllowPhraseComments = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') liveDatabaseMode = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optLetterWordCount = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optWordBreakdown = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optCompactBreakdown = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optShowCipherChart = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optGradientCharts = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optLoadUserHistCiphers = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optMatrixCodeRain = optArr[i] == "true" ? true : false; toggleCodeRain(); i++;
		if (typeof optArr[i] !== 'undefined') interfaceHue = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') interfaceSat = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') interfaceLit = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') fontHue = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') fontSat = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') fontLit = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') coderainHue = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') coderainSat = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') coderainLit = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') cipherMenuColumns = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') enabledCiphColumns = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') optPhraseLimit = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') dbPageItems = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') dbScrollItems = Number(optArr[i]); i++;
		if (typeof optArr[i] !== 'undefined') optGemSubstitutionMode = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optGemMultCharPos = optArr[i] == "true" ? true : false; i++;
		if (typeof optArr[i] !== 'undefined') optGemMultCharPosReverse = optArr[i] == "true" ? true : false;
	}
}

function importCalcOptionsLocal() { // load default options from ciphers.js
	var i = 0;
	if (typeof calcOptions[i] !== 'undefined') optNumCalcMethod = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optFiltCrossCipherMatch = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optFiltSameCipherMatch = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optShowOnlyMatching = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') compactHistoryTable = calcOptions[i]; i++; // not used, compatibility
	if (typeof calcOptions[i] !== 'undefined') optNewPhrasesGoFirst = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optShowExtraCiphers = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optAllowPhraseComments = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') liveDatabaseMode = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optLetterWordCount = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optWordBreakdown = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optCompactBreakdown = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optShowCipherChart = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optGradientCharts = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optLoadUserHistCiphers = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optMatrixCodeRain = calcOptions[i]; toggleCodeRain(); i++;
	if (typeof calcOptions[i] !== 'undefined') interfaceHue = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') interfaceSat = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') interfaceLit = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') fontHue = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') fontSat = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') fontLit = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') coderainHue = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') coderainSat = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') coderainLit = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') cipherMenuColumns = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') enabledCiphColumns = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optPhraseLimit = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') dbPageItems = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') dbScrollItems = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optGemSubstitutionMode = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optGemMultCharPos = calcOptions[i]; i++;
	if (typeof calcOptions[i] !== 'undefined') optGemMultCharPosReverse = calcOptions[i];
}

function dragOverHandler(ev) {
	//console.log('File(s) in drop zone')
	ev.preventDefault() // Prevent default drag behavior (Prevent file from being opened)
}

function exportHistoryCSV(arr, dbMode = false, addCiphers = '') {
	if (arr.length == 0) return
	
	var t = ""
	updateEnabledCipherCount()

	// table header (csv format, semicolon as separator)
	if (enabledCiphCount > 0) {
		t = "Word or Phrase"
		if (dbMode) t = "GEMATRO_DB"
		for (i = 0; i < cipherList.length; i++) {
			if (cipherList[i].enabled) {
				t += ";"+cipherList[i].cipherName // list of enabled ciphers
			}
		}
		t += "\n" // line break
	}
	
	// table contents
	for (i = 0; i < arr.length; i++) {
		t += arr[i].replace(";", "") // add phrase, remove semicolons (it is a separator)
		for (n = 0; n < cipherList.length; n++) {
			if (cipherList[n].enabled) {
				t += ";"+cipherList[n].calcGematria(arr[i]) // gematria value for each enabled cipher
			}
		}
		if (i+1 < arr.length) t += "\n" // line break, exclude last line
	}
	if (dbMode) t += "\n"+addCiphers // include ciphers inside database
	
	t = 'data:text/plain;charset=utf-8,'+encodeURIComponent(t) // format as text file
	if (dbMode) {
		download(getTimestamp()+"_GEMATRO_DB.txt", t); // download database
	} else {
		download(getTimestamp()+"_gematria.txt", t); // download file
	}
}

function exportCurrentDBquery(arr) {
	if (arr.length == 0) return
	
	var t = ""

	// table header (csv format, semicolon as separator)
	t = "Word or Phrase"
	for (i = 0; i < gemArrCiph.length; i++) {
		t += ";"+cipherList[gemArrCiph[i]].cipherName // list of ciphers used in query
	}
	t += "\n" // line break
	
	// table contents
	for (i = 0; i < arr.length; i++) {
		t += arr[i][1].replace(";", "") // add phrase[1], remove semicolons (it is a separator)
		for (n = 2; n < arr[i].length; n++) { // values start at [2]
			t += ";"+arr[i][n] // retrieve gematria value for each cipher
		}
		if (i+1 < arr.length) t += "\n" // line break, exclude last line
	}
	
	t = 'data:text/plain;charset=utf-8,'+encodeURIComponent(t) // format as text file
	download(getTimestamp()+"_gematria_DB_query.txt", t); // download file
}

function download(fileName, fileData) {
	var element = document.createElement('a'); // create invisible <a> element
	//element.setAttribute('href', 'data:text/plain;charset=utf-8, '+encodeURIComponent(filedata));

	element.setAttribute('href', fileData)
	element.setAttribute('download', fileName) // <a href=fileData download=fileName>

	document.body.appendChild(element) // add element
	element.click() // click on element to start download
	document.body.removeChild(element) // remove element
}