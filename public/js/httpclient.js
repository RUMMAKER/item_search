var HttpClient = function() {
    this.get = function(url) {
        return new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();
            req.onreadystatechange = function() { 
                if (req.readyState == 4) { // req finish
                    if (req.status == 200) { // status OK
                        resolve(req.responseText);
                    }
                    else {
                        reject(Error(req.statusText));
                    }
                }
            }
            req.onerror = function() {
                reject(Error("Network Error"));
            };
            req.open("GET", url);
            req.send();
        });
    }
}

var client = new HttpClient();