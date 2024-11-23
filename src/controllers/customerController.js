const controller={}; //se crea el objeto

controller.list=(req,res)=>{
//res.send("Hola controlador");
req.getConnection((err,conn)=>{
    conn.query('SELECT * FROM customer',(err,customers)=>{
        if(err){ 
            res.json(err);
        }
        console.log(customers);
        res.render('customers'  ,{
            data: customers  || [],   

        })
        

        
    })
})

};

controller.save=((req,res)=>{
        //console.log(req.body);
        const data=req.body;
        req.getConnection((err,conn)=>{
            conn.query('INSERT INTO customer set ?',[data],(err,customer)=>{ //la ? evita problemas de inyeccion
                console.log(customer);  
                req.flash('successMessage', 'Guardado con éxito.');              
                res.redirect("/"); //Redirige a la pagina inicial
            }) 
                
                 
        })     
    
   
})
//editar
controller.edit=((req,res)=>{
    const {id}=req.params; //recibe un parametro de la url
    req.getConnection((err,conn)=>{
      conn.query("SELECT * FROM customer WHERE id = ?", [id],(err,customers)=>{
        res.render('customer_edit',{ //Redirige a la pagina de customers_edit que esta en views
            data:customers[0] //envia los datos del objeto a la vista customers
        })     
       });
    })
})
//borrar
controller.delete=((req,res)=>{
    //console.log(req.params.id)
    const {id}=req.params; //recibe un parametro de la url
    req.getConnection((err,conn)=>{
       conn.query("DELETE FROM customer WHERE id = ?", [id],(err,rows)=>{
           res.redirect('/'); //Redirige a la pagina inicial 
        });
    })
})
//actualizar 

controller.update=((req,res)=>{
    const {id}=req.params; //recibe un parametro de la url
    const newCustomer=req.body;
    req.getConnection((err,conn)=>{
        conn.query('UPDATE  customer set ? WHERE id=?',[newCustomer,id],(err,rows)=>{
         res.redirect('/');   
        })
    })
})




module.exports=controller;
