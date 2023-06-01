const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fetch = require('node-fetch');
const cheerio = require('cheerio');

let app = express();

app.use(bodyParser.json());
app.use(cors());

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
    let params = req.params;
    let movieCd = params.movieCd;
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


app.listen(14524);