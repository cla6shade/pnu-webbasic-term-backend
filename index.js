const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fetch = require('node-fetch');
const cheerio = require('cheerio');



let app = express();

app.use(bodyParser.json());
app.use(cors());

const https = require('https');
const fs = require('fs');

const privkey = fs.readFileSync("./keys/privkey.pem");
const cert = fs.readFileSync("./keys/cert.pem");
const ca = fs.readFileSync("./keys/chain.pem");

const credentials = {
    key: privkey, cert: cert, ca: ca
};

https.createServer(credentials, app).listen(14524, "0.0.0.0", ()=>{
    console.log("서버가 시작되었습니다.");
})

let kobisRequest = async (movieCd) => {
    let ret = "";
    try {
        let response = await fetch("https://www.kobis.or.kr/kobis/mobile/mast/mvie/searchMovieDtl.do?movieCd="
            + movieCd.toString());
        let html = await response.text();

        let $ = cheerio.load(html);
        let imgBaseUrl = "https://www.kobis.or.kr/";

        let thumbElement = $(".info_basic > a");
        ret = imgBaseUrl + thumbElement.attr("href");
    } catch (e) {
        console.log(e);
    }
    return ret;
}

app.get("/", (req, res) => {
    let movieCd = req.query.movieCd
    if (typeof movieCd === "undefined") {
        res.status(401).json({message: "잘못된 요청입니다."});
        return;
    }
    kobisRequest(movieCd).then(url => {
        res.json({
            movieCd: movieCd,
            poster: url
        })
    })
})

// test
//
// kobisRequest(20231496).then(uri => {
//     console.log(uri);
// })