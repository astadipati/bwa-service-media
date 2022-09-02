const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base64Img = require('base64-img');

// model
const {Media} = require('../models')

router.get('/', async(req, res)=>{
  const media = await Media.findAll({
    // hanya panggil id dan image saja tanpa created & updated
    attributes: ['id','image']
  });
  
  const mappedMedia = media.map((m)=>{
    m.image = `${req.get('host')}/${m.image}`;
    return m
  })

  return res.json({
    status:'success',
    data: mappedMedia
  });
});

router.post('/', (req, res) => {
  const image = req.body.image;
  if (!isBase64(image,{mimeRequired: true})) {
    return res.status(400).json({status:'error', message: 'Invalid base64'});
  }
  base64Img.img(image, './public/images', Date.now(), async(err, filepath)=>{
    if (err){
      return res.status(400).json({status:'error', message: err.message});
    }
    const filename = filepath.split('/').pop();

    const media = await Media.create({image: `images/${filename}`});

    return res.json({
      status: 'success',
      data:{
        id: Media.id,
        image: `${req.get('host')}/images/${filename}`
      }
    })
  })
});

module.exports = router;
