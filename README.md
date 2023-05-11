# super simple pdf search app built in react ⚡

credit to yurydelendik/pdfjs-react for the base code

## Running

Make sure to replace your cors.sh creds in .env
No it's not secure, but it's a quick and dirty way to get around CORS issues and I've only built this for a hackathon (sorry).

```
mv .env.example .env
yarn install
yarn start
```

Test by going to http://localhost:3000?url=test.pdf
