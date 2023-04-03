const PORT = process.env.PORT || 8000;
const express = require("express");
// like fetch in JS
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const url = "https://www.theguardian.com/environment/climate-crisis";

const newspapers = [
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/environment/climate-change",
    base: "",
  },
  {
    name: "guardian",
    address: url,
    base: "",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk/climate-change/",
    base: "https://www.telegraph.co.uk",
  },
  {
    name: "bbc",
    address: "https://www.bbc.com/news/science-environment-56837908",
    base: "https://www.bbc.com",
  },
  {
    name: "elpais",
    address: "https://elpais.com/noticias/cambio-climatico/",
    base: "",
  },
  {
    name: "publico",
    address: "https://www.publico.es/tag/cambio-climatico",
    base: "https://www.publico.es",
  },
  {
    name: "thetimesofindia",
    address: "https://timesofindia.indiatimes.com/topic/climate-change",
    base: "",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $("a:contains(climate), a:contains(cambio climático)", html).each(
      function () {
        const title = $(this).text();
        const articleUrl = $(this).attr("href");
        articles.push({
          title,
          articleUrl: newspaper.base + articleUrl,
          source: newspaper.name,
        });
      }
    );
  });
});

app.get("/", (req, res) => {
  res.json("Welcome to my Climate Change News API");
});

// nodemon makes the server restart after every change. Without nodemon, you'd need to do restart the server manually to be able to see the changes.

app.get("/news", (req, res) => {
  // res.json() ==> converts the body -articles- to JSON format - yes
  res.json(articles);
});

app.get("/news/:newspaperId", (req, res) => {
  // whatever input we put as newspaperId on the search bar is going to appear as well on the console

  // Id is not a number in this case, ID is the result printed in the console after you type whatever you want on the search bar. ID = name of newspaper
  const newspaperId = req.params.newspaperId;
  console.log(newspaperId);

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;
  // console.log(newspaperAddress);

  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $("a:contains(climate), a:contains(climático)", html).each(function () {
        const title = $(this).text();
        const articleUrl = $(this).attr("href");
        specificArticles.push({
          title,
          articleUrl: newspaperBase + articleUrl,
          source: newspaperId,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
