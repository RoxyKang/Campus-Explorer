/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/query");

        xhr.onload = () => {
            let result = JSON.parse(xhr.responseText);
            if (typeof result.status !== "undefined" && result.status === "OK") {
                resolve(result);
            } else {
                reject({error: "Could not find address"});
            }
        }

        xhr.addEventListener("error", (err) => {
            reject({error: "Could not reach REST API :: POST: /query"});
        })

        xhr.send(JSON.stringify(query));
    });
};
