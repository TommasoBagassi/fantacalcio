var url = "inc/lista_voti.js",
	playerMap,
	req = new XMLHttpRequest();

req.addEventListener("load", transferComplete, false);
req.addEventListener("error", transferFailed, false);
req.addEventListener("abort", transferCanceled, false);

req.open('GET', url);
req.responseType = "json";
req.send();

function transferComplete(e) {
	playerMap = JSON.parse(req.responseText);
	self.postMessage(playerMap);
}
 
function transferFailed(e) {
	self.postMessage("error");
}
 
function transferCanceled(e) {
	self.postMessage("canceled");
}