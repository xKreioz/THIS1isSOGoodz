const express = require("express");
const swagger = require("swagger-ui-express");
const yaml = require("yamljs");

const path = require('path');
const app = express();
const port = 8000;

app.use(express.json());
const swaggerDocument = yaml.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api', swagger.serve, swagger.setup(swaggerDocument));

//info
let bookky = [
    {id: 1, name: "vivi", price: 20},
    {id: 2, name: "phai", price: 100},
    {id: 3, name: "meiji", price: 3000}
]
let counter = 4 //นับidเพื่อใส่ข้อมูลเพิ่ม

app.post('/bookky', (req, res) =>{
    let newbookky = req.body;
    if(!newbookky.name || !newbookky.price){
        return res.status(400).json({message: 'ใส่ให้ถูกนะเว่ย'});
    }
    newbookky.id = counter++ ;
    bookky.push(newbookky);
    res.status(201).json({message: 'เก่งมากเสร็จแล้ว'}); 
})

app.get('/bookky', (req, res)=>{
    const booklist = bookky.map(book => {
        return {
            id: book.id, name: book.name, price: book.price
        }
    })

    const sort = req.query.sort;
    if(sort == 'true'){
        booklist.sort();
    }
    
    res.status(200).json(booklist)
})

app.put('/bookky/:id', (req, res) => {
    let id = Number(req.params.id);
    let updatebookky = req.body;
    let index = bookky.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "book not found" });
    }

    bookky[index].name = updatebookky.name || bookky[index].name;
    bookky[index].price = updatebookky.price || bookky[index].price;
    
    res.json({
        message: "Update book complete",
        data: bookky[index]
    });
});

app.delete('/bookky/:id', (req, res) => {
    let id = Number(req.params.id);
    let index = bookky.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "book not found" });
    }

    bookky.splice(index, 1);

    res.status(200).json({
        message: "Deleted book from inventory successfully",
        indexDeleted: index
    });
});


// app.get('/search', (req, res) => {
//     const name = req.query.name;
//     let Name = bookky.find(t => t.name === name)

//     res.status(200).json({message: 'เจอแล้วจร้า',data: Name});
// });

app.get('/search', (req, res) => {
    const name = req.query.name;
    
    // เปลี่ยนจาก .find() เป็น .filter() และใช้ .includes()
    let results = bookky.filter(t => t.name.includes(name));

    if (results.length === 0) {
        return res.status(404).json({ message: 'หาไม่เจอจ้า' });
    }

    res.status(200).json({ message: 'เจอแล้วจร้า', data: results });
});


app.listen(
    port, () => {
        console.log('กูกำลังรันอยู่นะ')
    }
)