const express=require('express');
const router=express.Router();
//importando del controlador
const customerController=require('../controllers/customerController');
router.get('/',customerController.list)
router.post('/add',customerController.save)
router.get('/delete/:id',customerController.delete)
router.get('/update/:id',customerController.edit)
router.post('/update/:id',customerController.update)




router.get('/',(req,res)=>{
    res.send("Gei el que lo lea");
})

module.exports=router;

