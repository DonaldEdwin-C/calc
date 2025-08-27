import http from 'http'
import url from 'url'

const server =  http.createServer(async (req,res)=>{
  const parsedUrl = url.parse(req.url,true)
  const query = parsedUrl.query

  if(parsedUrl.pathname ==='/rate' && req.method==='GET'){

  let fundName = query.type

   if(fundName ==='CMMF'){

   let response = await fetch('https://clients.cytonn.com/api/client-unitization/show-unit-funds/17')
    let  data = await response.json()

    res.writeHead(200)
    res.end(JSON.stringify(data))
   }
   else if(fundName==='CHYF'){
    let response = await fetch('https://clients.cytonn.com/api/client-unitization/show-unit-funds/37')
    let  data = await response.json()

    res.writeHead(200)
    res.end(JSON.stringify(data))
   }
 else {
     res.writeHead(404)
    res.end('The resoruce is ')
 }

  }
 
})
const PORT=3000
  server.listen(3000,()=>{
    console.log(`Server is running on port ${PORT}` )
  })

