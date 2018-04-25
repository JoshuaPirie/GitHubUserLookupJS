const githubApiUrl = "https://api.github.com";
// get username from url params
const username = new URL(window.location.href).searchParams.get("username");
// regex to match github usernames taken from https://github.com/shinnn/github-username-regex
const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
// svg icons taken from GitHub
const svgIcons = {
    company: `<svg class="icon" version="1.1" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M16 12.999c0 .439-.45 1-1 1H7.995c-.539 0-.994-.447-.995-.999H1c-.54 0-1-.561-1-1 0-2.634 3-4 3-4s.229-.409 0-1c-.841-.621-1.058-.59-1-3 .058-2.419 1.367-3 2.5-3s2.442.58 2.5 3c.058 2.41-.159 2.379-1 3-.229.59 0 1 0 1s1.549.711 2.42 2.088C9.196 9.369 10 8.999 10 8.999s.229-.409 0-1c-.841-.62-1.058-.59-1-3 .058-2.419 1.367-3 2.5-3s2.437.581 2.495 3c.059 2.41-.158 2.38-1 3-.229.59 0 1 0 1s3.005 1.366 3.005 4"></path></svg>`,
    location: `<svg class="icon" version="1.1" viewBox="0 0 12 16" width="12" height="16"><path fill-rule="evenodd" d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path></svg>`,
    email: `<svg class="icon" version="1.1" viewBox="0 0 14 16" width="14" height="16"><path fill-rule="evenodd" d="M0 4v8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1zm13 0L7 9 1 4h12zM1 5.5l4 3-4 3v-6zM2 12l3.5-3L7 10.5 8.5 9l3.5 3H2zm11-.5l-4-3 4-3v6z"></path></svg>`,
    blog: `<svg class="icon" version="1.1" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`
}

const nullOrEmpty = x => x === null || x === "";
// adds html to end of content div
const displayHTML = html =>
    $(document).ready(() => // wait for document ready before appending
        $("#content").append(html));
// displays div with p with error text inside
const displayError = text =>
    displayHTML($("<div>", {class: "output"})
                  .html($("<p>", {class: "error-text"})
                          .text(text)));
// displays user data
const displayData = data => {
    console.log("request success");
    console.log(data);

    // create output div
    const output = $("<div>", {class: "output"});
    // append user avatar
    output.append($("<img>", {class: "avatar", src: data.avatar_url}));
    // define function for appending spans to output
    const spanAppend = (className, html, cond) => {
        if(!nullOrEmpty(cond === undefined ? html : cond)) // check html param if cond undef
            output.append($("<span>", {class: className})
                            .html(html));
    }
    // apply function using each element of array
    [
        ["name-span", data.name],
        ["login-span", $("<a>", {href: data.html_url}).html(data.login), data.login],
        ["bio-span", data.bio]
    ].forEach(x => spanAppend(...x));
    // define function for appending items to list
    const listAppend = (list, htmlA, htmlB, cond) => {
        if(!nullOrEmpty(cond === undefined ? htmlB : cond))
            list.append($("<li>")
                          .append(htmlA)
                          .append($("<span>")
                                    .html(htmlB)));
    }
    // create list for main profile info
    const infoList = $("<ul>", {class: "info-list"});
    // apply function using created list and each element of array
    [
        [svgIcons.company, data.company],
        [svgIcons.location, data.location],
        [svgIcons.email, $("<a>", {href: `mailto:${data.email}`}).html(data.email), data.email],
        [svgIcons.blog, $("<a>", {href: data.blog}).html(data.blog), data.blog]
    ].forEach(x => listAppend(infoList, ...x));
    output.append(infoList); // append list to output
    // create list for extra profile info
    const extraInfoList = $("<ul>", {class: "info-list"});
    // apply function using new list (and convert first element to label)
    [
        ["Repositories", data.public_repos],
        ["Gists", data.public_gists],
        ["Followers", data.followers],
        ["Following", data.following],
        ["Created On", new Date(data.created_at).toLocaleDateString("en-AU"), data.created_at]
    ].forEach(x => listAppend(extraInfoList, $("<label>").html(`${x[0]}: `), x[1], x[2]));
    output.append(extraInfoList); // append list to output
    // display the output div
    displayHTML(output);
}

// username is null when search param doesn't exist and empty when user submits with no input
if(!nullOrEmpty(username)) {
    // check if valid github username
    if(githubUsernameRegex.test(username)) {
        // request user data (and handle success/error using Promise methods then/catch)
        $.get(`${githubApiUrl}/users/${username}`)
            .then(displayData)
            .catch(data => {
                console.log("request error");
                console.log(data);
                
                if(data.status == 404) // not strict equals in case status is string
                    displayError(`The user ${username} does not exist.`)
                else // some other unknown error occured
                    displayError(`${data.status} ${data.statusText}`);
            })
    }
    else {
        console.log("input error");
        displayError(`${username} is not a valid GitHub username.`);
    }
}
