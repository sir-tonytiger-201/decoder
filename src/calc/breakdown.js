// ================= Word Breakdown & Cipher Chart ==================

var breakCipher = "English Ordinal" // current cipher for breakdown
var bgCol = "var(--breakdown-bg-accent)" // breakdown table background color

function getSum(total, num) { // used to .reduce() array, adds all values
    return total + num;
}

function gemCalcModeLabel(curCipher) {
	if (optGemMultCharPos && curCipher.LetterCount > 0) return ' - x1 ... x'+curCipher.LetterCount
	else if (optGemMultCharPosReverse && curCipher.LetterCount > 0) return ' - x'+curCipher.LetterCount+' ... x1'
	return ""
}

$(document).ready(function(){
	// update breakdown on mouse enter/leave/click events
	$("body").on("mouseenter", ".phraseGemCiphName", function () {
		updateWordBreakdown($(this).text(), false);
	});
	$("body").on("mouseleave", ".phraseGemCiphName", function () {
		updateWordBreakdown();
	});
	$("body").on("click", ".phraseGemCiphName", function () {
		updateWordBreakdown($(this).text(), true);
	});
});

function updateWordBreakdown(impName = breakCipher, impBool = false, chartUpd = true) { // false - preview temporary (hover), true - lock breakdown to a specific cipher
	var x, curCipher, cSpot
	var o, oo, acw, acl
	var chLimit = 30 // character limit, used to switch to a long breakdown style

	updateEnabledCipherCount()
	$("#BreakTableContainer").removeClass("hideValue") // unhide breakdown
	$("#BreakdownDetails").attr("style", "") // reset padding (gematria card)

	if (impBool == true) breakCipher = impName // lock to a specific cipher
		
	if (!optShowCipherChart) $("#ChartSpot").attr("style", "border: none;"); // reset gradient for cipher chart
	if (enabledCiphCount == 0 || breakCipher == "" && impName == "") {
		document.getElementById("BreakdownSpot").innerHTML = ""
		document.getElementById("ChartSpot").innerHTML = ""
		$("#ChartSpot").attr("style", "border: none;"); // reset gradient for cipher chart
		return;
	}

	for (x = 0; x < cipherList.length; x++) {
		if (cipherList[x].cipherName == impName) {
			cSpot = x
			if (chartUpd) updateCipherChart(cipherList[x])
			break
		}
	}
	curCipher = cipherList[cSpot]

	var leftToRightBreak = true
 	// if Hebrew Aleph is assigned in current cipher
	if (curCipher.cArr.indexOf(1488) > -1) {
		curCipher.calcBreakdown(sVal().replace(/[\u0591-\u05BD\u05BF-\u05C7]/g,"")) // remove Hebrew vowels, exclude dash
	}
 	// if Arabic Alef is assigned in current cipher
	if (curCipher.cArr.indexOf(1575) > -1) {
		curCipher.calcBreakdown(sVal().replace(/[\u0600-\u061F\u0640\u064B-\u066D\u06D4\u06D6-\u06ED\u06F0-\u06F9]/g,"")) // remove Arabic marks and non letter characters
	}
	// use right to left writing (Hebrew, Arabic)
	if (curCipher.cArr.indexOf(1488) > -1 || curCipher.cArr.indexOf(1575) > -1) {
		curCipher.cp.reverse(); curCipher.cv.reverse(); curCipher.sumArr.reverse() // right-to-left direction
		if (curCipher.WordCount > 1) {
			curCipher.cp.push(curCipher.cp.shift()) // remove first element and add to the end of array (space, used for word sum)
			curCipher.cv.push(curCipher.cv.shift())
		}
		leftToRightBreak = false
	} else { // left to right, use regular word breakdown
		curCipher.calcBreakdown(sVal()) // calculate breakdown for current phrase
	}

	if (curCipher.sumArr.length > 0) {
		
		var oStart = ''; var o ='';

		var RTLclass = '';
		if (!leftToRightBreak) RTLclass = 'BreakRTL' // use different container padding for right to left direction

		if (optLetterWordCount == true) {
			if (curCipher.LetterCount > 1 || curCipher.LetterCount == 0) {acl = " letters, "} else {acl = " letter, "}
			if (curCipher.WordCount > 1) {acw = " words"} else {acw = " word"}
			oStart += '<div class="LetterCounts">' + curCipher.LetterCount + acl + curCipher.WordCount + acw + '</div>'
		}

		if (optCompactBreakdown == true) {
			var simplePhr = ""
			if (optAllowPhraseComments) {
				simplePhr = sValNoComments() // exclude text inside [...]
			} else {
				simplePhr = sVal() // display full phrase
			}
			oStart += '<div id="SimpleBreak">'
			oStart += '<span class="breakPhrase">' + simplePhr + '</span><span class="breakPhrase"> = </span><span class="breakSum">' + curCipher.sumArr.reduce(getSum) + ' </span>' // add all values in array
			oStart += '<span class="breakCipher"><font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)"> (' + curCipher.cipherName + gemCalcModeLabel(curCipher) + ')</font></span>'
		}

		if (optWordBreakdown == true && curCipher.cp.length <= chLimit ) { // character limit, calculated even if out of screen bounds
			var tdCount = 0; var wCount = 0;

			o += '</div><div id="BreakTableContainer" class="'+RTLclass+'"><table class="BreakTable">'
			// o += ' style="background: '+bgCol+' -webkit-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
			// o += 'background: '+bgCol+' -o-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
			// o += 'background: '+bgCol+' -moz-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
			// o += 'background: '+bgCol+' linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));">'
			o += '<tbody><tr>'

			if (leftToRightBreak) { // left to right
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							o += '<td class="BreakChar" style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							o += '<td class="BreakChar" style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else {
						o += '<td class="BreakWordSum" rowspan="2">' + curCipher.sumArr[wCount] + '</td>'
						wCount++
					}
					tdCount++
				}
				o += '<td class="BreakPhraseSum" rowspan="2"><font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.sumArr.reduce(getSum) + '</font></td>'
				o += '</tr><tr>'
				tdCount++
				for (z = 0; z < x; z++) {
					if (curCipher.cv[z] !== " ") {
						o += '<td class="BreakVal">' + curCipher.cv[z] + '</td>'
					}
				}
			} else { // right to left (Hebrew, Arabic)
				o += '<td class="BreakPhraseSum" rowspan="2"><font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.sumArr.reduce(getSum) + '</font></td>'
				var curBreakWord = '' // current word, added to main 'o' string
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							curBreakWord += '<td class="BreakChar" style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							curBreakWord += '<td class="BreakChar" style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else {
						curBreakWord = '<td class="BreakWordSum" rowspan="2">' + curCipher.sumArr[wCount] + '</td>' + curBreakWord // prepend word sum (displayed on the left)
						o += curBreakWord
						curBreakWord = ''
						wCount++
					}
					tdCount++
				}
				if (curCipher.WordCount == 1) o += curBreakWord // single word
				o += '</tr><tr>'
				tdCount++
				for (z = 0; z < x; z++) {
					if (curCipher.cv[z] !== " ") {
						o += '<td class="BreakVal">' + curCipher.cv[z] + '</td>'
					}
				}
			}
			if (optCompactBreakdown == true) o += '</tr><tr><td colspan=' + tdCount + ' class="CipherEnd"><font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.cipherName + gemCalcModeLabel(curCipher) + '</font></td></tr></table></div>'
			else o += '</tr></tbody></table></div>'

			o = oStart + o // prepend phrase, word/letter count

		} else if (optWordBreakdown == true && curCipher.cp.length > chLimit) { // breakdown for long phrases

			var wrdCount = 0; var z = 0;
			var breakArr = buildLongBreakdown(curCipher) // index of word in phraseBox, used to mark table end
			var curBreakRow = '' // current row, added to main 'o' string

			if (leftToRightBreak) { // left to right
				curBreakRow = '<table class="BreakTableRow" style="padding-top: 0.5em;"><tbody><tr>'
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							curBreakRow += '<td class="BreakChar">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							curBreakRow += '<td class="BreakChar">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else {
						curBreakRow += '<td class="BreakWordSum" rowspan="2"><font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.sumArr[wrdCount] + '</font></td>'
						if (breakArr.indexOf(wrdCount) > -1 || wrdCount == curCipher.WordCount-1) { // include values for last word
							curBreakRow += '</tr><tr>'
							for (z; z < x; z++) {
								if (curCipher.cv[z] !== " ") {
									curBreakRow += '<td class="BreakValDark">' + curCipher.cv[z] + '</td>'
								}
							}
							curBreakRow += '</tr></tbody></table>'
							if (wrdCount !== curCipher.WordCount-1) curBreakRow += '<table class="BreakTableRow"><tbody><tr>'
						}
						wrdCount++
					}
				}
				o = '</div><div id="BreakTableContainer" class="'+RTLclass+'">' + curBreakRow
			} else { // right to left (Hebrew, Arabic)
				curBreakRow = '<table class="BreakTableRow"><tbody><tr>'
				curBreakRow += '<td class="BreakWordSum" rowspan="2"><font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.sumArr[wrdCount] + '</font></td>'
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							curBreakRow += '<td class="BreakChar">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							curBreakRow += '<td class="BreakChar">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else {
						if (breakArr.indexOf(wrdCount) > -1 || wrdCount == curCipher.WordCount-1) { // include values for last word
							curBreakRow += '</tr><tr>'
							for (z; z < x; z++) {
								if (curCipher.cv[z] !== " ") {
									curBreakRow += '<td class="BreakValDark">' + curCipher.cv[z] + '</td>'
								}
							}
							curBreakRow += '</tr></tbody></table>'
							o = curBreakRow + o // prepend current row to main table
							if (wrdCount !== curCipher.WordCount-1) curBreakRow = '<table class="BreakTableRow"><tbody><tr>'
						}
						wrdCount++
						if (wrdCount !== curCipher.WordCount) curBreakRow += '<td class="BreakWordSum" rowspan="2"><font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.sumArr[wrdCount] + '</font></td>'
					}
				}
				o = '</div><div id="BreakTableContainer" class="'+RTLclass+'"><div style="padding: 0.25em"></div>' + o // prepend opening div, include padding
			}
			o = oStart + o // prepend phrase, word/letter count
			if (optCompactBreakdown == true) {
				o += '<div id="BreakSumLong"><span class="breakSumDark">' + curCipher.sumArr.reduce(getSum) + ' </span>'
				o += '<span class="breakCipher" style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.cipherName + gemCalcModeLabel(curCipher) + '</span></div></div>'
			} else {
				o += '<div style="padding: 0.5em"></div>'
			}
		}
	} else {
		o = ""
	}

	document.getElementById("BreakdownSpot").innerHTML = o

	if (curCipher.sumArr.length > 0 && optCompactBreakdown == false) { // include plain phrase inside breakdown chart 
		var simplePhr = ""
		if (optAllowPhraseComments) {
			simplePhr = sValNoComments() // exclude text inside [...]
		} else {
			simplePhr = sVal() // display full phrase
		}
		var chartClass = 'SimpleBreakChart'
		if (curCipher.cp.length > chLimit) chartClass = 'SimpleBreakChartLong'
		o = '<tr><td colspan=' + tdCount + '>'
		o += '<div class="'+chartClass+'"><span class="breakPhraseChart">' + simplePhr + ' = ' + curCipher.sumArr.reduce(getSum) + ' </span>' // add all values in array
		o += '<span class="breakPhraseChartCiphName" style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">(' + curCipher.cipherName + gemCalcModeLabel(curCipher) + ')</span></div></td></tr>'
		$('#BreakTableContainer').prepend(o) // insert in the beginning of the table
	}

	oo = 'background: var(--body-bg-accent);'
	if (optGradientCharts) {
		oo = 'background: '+bgCol+' -webkit-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		oo += 'background: '+bgCol+' -o-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		oo += 'background: '+bgCol+' -moz-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		oo += 'background: '+bgCol+' linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
	}
	$("#BreakTableContainer").attr("style", oo);

	if ( $(window).width() <= $("#BreakTableContainer").outerWidth() + 50) { // breakdown doesn't fit viewport
		$("#BreakTableContainer").addClass("hideValue") // hide element
	}
}

function buildLongBreakdown(curCipher) {
	var i; var maxRowWidth = 36
	var newLine = true; words = 0; n = "";
	var breakArr = []; var widthCount = 0;

	for (i = 0; i < curCipher.cv.length; i++) {
		if (curCipher.cv[i] !== " ") {
			if (n == "") {n = i}
			if (curCipher.cv[i] > 99) {
				widthCount += 1.5
			} else {
				widthCount++
			}
			if (widthCount > maxRowWidth && newLine == false) {
				breakArr.push(words - 1)
				widthCount = 0
				i = n - 1
				newLine = true
			}
		} else {
			widthCount += 2
			words++
			n = ""
			newLine = false
		}
	}
	return breakArr
}

function updateCipherChart(curCipher) {

	if (optShowCipherChart == false) {
		document.getElementById("ChartSpot").innerHTML = ""
		return
	}

	var o = 'background: var(--body-bg-accent);'
	if (optGradientCharts) {
		o = 'background: '+bgCol+' -webkit-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		o += 'background: '+bgCol+' -o-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		o += 'background: '+bgCol+' -moz-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		o += 'background: '+bgCol+' linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
	}
	o += 'min-height: 166px;' // avoid layout shift when Agrippa ciphers are active
	o += 'margin-top: 1em;'
	o += 'margin-bottom: 0.5em;'
	o += 'padding: 0.8em;'
	$("#ChartSpot").attr("style", o);

	o = '<table id="ChartTable" '
	
	// gradient table background based on cipher color
	// o += 'style="background: '+bgCol+' -webkit-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0)); '
	// o += 'background: '+bgCol+' -o-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0)); '
	// o += 'background: '+bgCol+' -moz-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0)); '
	// o += 'background: '+bgCol+' linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));">'
	o += '<tbody><tr>'

	o += '<td colspan="' + curCipher.cArr.length + '">'
	o += '<font style="font-size: 150%; font-weight: 500; color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.cipherName + '</font>'
	o += '</td></tr><tr>'

	var halfL = curCipher.cArr.length / 2
	for (var x = 0; x < curCipher.cArr.length; x++) {
		if (x - halfL == 0 || x - halfL == 0.5) {
			o += '</tr><tr>'
			for (var y = 0; y < x; y++) { // 2nd row (values)
				o += '<td class="ChartVal">' + curCipher.vArr[y] + '</td>'
			}
			o += '</tr><tr>'
		}
		o += '<td class="ChartChar" font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + String.fromCodePoint(curCipher.cArr[x]) + '</td>'
	}
	if (curCipher.cArr.length % 2 == 1) { o += '<td class="ChartChar" font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)"></td>' } // empty character cell to make even rows
	o += '</tr><tr>'
	for (y; y < x; y++) {
		o += '<td class="ChartVal">' + curCipher.vArr[y] + '</td>' // 4th row (values)
	}
	if (curCipher.cArr.length % 2 == 1) { o += '<td class="ChartVal"></td>' } // empty value cell to make even rows
	o += '</tr></tbody></table>'

	document.getElementById("ChartSpot").innerHTML = o
}

function updateCipherChartGemCard(impName = breakCipher) {

	if (optShowCipherChart == false) {
		document.getElementById("ChartSpot").innerHTML = ""
		return
	}

	var cSpot
	for (x = 0; x < cipherList.length; x++) {
		if (cipherList[x].cipherName == impName) { cSpot = x; break; }
	}
	curCipher = cipherList[cSpot]

	// gradient table background based on cipher color
	o = '<table id="ChartTable" style="background: var(--body-bg-accent);">'
	if (optGradientCharts) {
		o = '<table id="ChartTable" style="background: '+bgCol+' -webkit-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		o += 'background: '+bgCol+' -o-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		o += 'background: '+bgCol+' -moz-linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));'
		o += 'background: '+bgCol+' linear-gradient(0deg,hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 0.2), rgba(0,0,0,0.0));">'
	}
	o += '<tbody><tr>'

	o += '<td colspan="' + curCipher.cArr.length + '">'
	o += '<font style="font-size: 150%; font-weight: 500; color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + curCipher.cipherName + '</font>'
	o += '</td></tr><tr>'

	var halfL = curCipher.cArr.length / 2
	for (var x = 0; x < curCipher.cArr.length; x++) {
		if (x - halfL == 0 || x - halfL == 0.5) {
			o += '</tr><tr>'
			for (var y = 0; y < x; y++) { // 2nd row (values)
				o += '<td class="ChartVal">' + curCipher.vArr[y] + '</td>'
			}
			o += '</tr><tr>'
		}
		o += '<td class="ChartChar" font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)">' + String.fromCodePoint(curCipher.cArr[x]) + '</td>'
	}
	if (curCipher.cArr.length % 2 == 1) { o += '<td class="ChartChar" font style="color: hsl('+curCipher.H+' '+curCipher.S+'% '+curCipher.L+'% / 1)"></td>' } // empty character cell to make even rows
	o += '</tr><tr>'
	for (y; y < x; y++) {
		o += '<td class="ChartVal">' + curCipher.vArr[y] + '</td>' // 4th row (values)
	}
	if (curCipher.cArr.length % 2 == 1) { o += '<td class="ChartVal"></td>' } // empty value cell to make even rows
	o += '</tr></tbody></table>'

	document.getElementById("ChartSpot").innerHTML = o
	$("#ChartTable").addClass("borderCipherTable") // cipher chart with borders

	o = 'border: none;' // clear div gradient background, remove border
	o += 'margin-top: 1em;'
	o += 'margin-bottom: 0.5em;'
	o += 'padding: 0.4em;'
	$("#ChartSpot").attr("style", o)
}