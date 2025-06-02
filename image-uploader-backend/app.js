const express=require('express')
const multer=require('multer')
const AWS =require('aws-sdk')
const fs=require('fs')
const path=require('path')
const { error } = require('console')
const cors=require('cors')


require('dotenv').config()

const app=express()
const port=3000
app.use(cors())

// Configure the multer for file Upload
const storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'uploads/')
    },
    filename:function(req,file,callback)
    {
        callback(null,Date.now()+path.extname(file.originalname))
    }
})
const upload=multer({storage})

// Aws configuration
AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})
const s3=new AWS.S3()


app.post('/upload',upload.single('image'),(req,res)=>
{
    const fileContent=fs.readFileSync(req.file.path)
    const params={
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.filename,
        Body: fileContent,
        ContentType: req.file.mimetype
    }

    s3.upload(params,(error,data)=>
    {
        if(error)
        {
            console.log("error",error)
        }
        res.send({ImageURL:data.Location})
    })
})
app.get("/gallery", async (req, res) => {
  const params = { Bucket: process.env.AWS_BUCKET_NAME };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const imageUrls = data.Contents.map(item => (
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    ));
    res.json({ images: imageUrls });
  } catch (err) {
    console.error("Gallery load error:", err);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});


app.listen(3000,(req,res)=>{
    console.log("App running")
})