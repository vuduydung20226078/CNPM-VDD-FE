const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 8080;
const path = require('path'); // Import module path

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'loginRegister')));
app.use(express.static(path.join(__dirname, 'Home')));
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));


// Path to the data file
const DATA_FILE = './data.json';
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
// Utility to read data.json
function readData() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return { users: [] };
}

// Utility to write to data.json
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API to handle user registration
app.post('/register', (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ các phần!' });
    }

    const data = readData();

    // Check for existing username or email
    const accountExists = data.accounts.find(account => account.username === username || account.email === email);
    if (accountExists) {
        return res.status(409).json({ message: 'Username or Email này đã tồn tại' });
    }
    const existingAccountIDs = userExists.map(user => user.accoundID);
    let newAccountID = 1;
        while (existingAccountIDs.includes(newAccountID)) {
            newAccountID++;
        }
    // Add new user
    const newUser = { email, username, password, accountID: newAccountID };
    data.users.push(newUser);
    writeData(data);
    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
});

// API to handle user login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ email và mật khẩu!' });
    }

    const data = readData();
    const account = data.accounts.find(account => account.email === email && account.password === password);
    let userFind = [];
    if (!account) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    } else {
        userFind = data.users.find(user => user.accountID === account.accountID)
    }

    res.status(200).json({ 
        message: 'Đăng nhập thành công!',  
        userID: userFind.userID,
        username: account.username,
        imageLink: userFind.imageLink,
        name: userFind.name,
        address: userFind.address,
        phone: userFind.phone,
        role: userFind.role
    });
});
//api get-all books
app.get('/api/books/allbooks', (req, res) => {
    const data = readData();
    const sortedBooks = [...data.books].sort((a, b) => a.bookID - b.bookID);
    res.json(sortedBooks); // Return the books data from the JSON file
});
//api get list borrow of user
app.get('/api/borrows/getAll/:id', (req, res) => {
    const userID = parseInt(req.params.id);
    const data = readData();
    const listBorrow = data.borrows.filter(borrow => borrow.userID === userID);
    const listBookBorrow = listBorrow.map(borrow => {
        const bookID = borrow.bookID;
        bookFound = data.books.find(book => book.bookID = bookID);
        return {
            borrowID: borrow.borrowID,
            bookID: bookFound.bookID,
            title: bookFound.title,
            borrowDate: borrow.borrowDate,
            dueDate: borrow.dueDate,
            imageLink: bookFound.imageLink
        }
    });
    res.json(listBookBorrow); 
});
//api get info book by bookID
app.get('/api/books/:id', (req, res) => {
    const bookID = parseInt(req.params.id, 10); 
    if (isNaN(bookID)) {
        return res.status(400).json({ message: 'Invalid book ID' });
    }
    const data = readData();
    const book = data.books.find(b => b.bookID === bookID);

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
});
//api get comments by accountID for each book
app.get('/api/comments/getcmt/:id', (req, res) => {
    const bookID = parseInt(req.params.id, 10);
    if (isNaN(bookID)) {
        return res.status(400).json({ message: 'Invalid book ID' });
    } 
    const data = readData();
    let comment = [];
    const commentsByBook = data.comments.filter(comment => comment.bookID === bookID);
    if (commentsByBook.length === 0) {
        return res.status(404).json({ message: 'No comments found for this bookID' });
    };
    comment = commentsByBook.map(comment => {
        const userFound = data.users.find(user => user.userID === comment.userID);
        const accountFound = data.accounts.find(account => account.accountID === userFound.accountID);
        return {...comment, imageLink: userFound.imageLink, username: accountFound.username};
    });
    res.json(comment); 
});
//api post comments
app.post('/api/comments/post', (req, res) => {
    const {bookID, userID, comment } = req.body; 
    const currentTime = new Date()
    const lastUpdate = formatDate(currentTime)
    if (!bookID || !userID || !comment) {
        return res.status(400).json({ message: 'Tất cả các trường đều cần thiết!' });
    }
    const data = readData();
    const book = data.books.find(book => book.bookID === parseInt(bookID));
    if (!book) {
        return res.status(404).json({ message: 'Sách không tồn tại!' });
    }
    const existingCmtIDs = data.comments.map(comment => comment.commentID);
    let newCmtID = 1;
    while (existingCmtIDs.includes(newCmtID)) {
        newCmtID++;
    }
    const newComment = {
        commentID: newCmtID,
        bookID,
        userID,
        comment,
        lastUpdate
    };
    data.comments.push(newComment);
    writeData(data);
    res.status(201).json({ 
        message: 'Bình luận đã được thêm thành công!',
        lastUpdate,
        commentID: newCmtID
    });
});
// api get rate by userID
app.get('/api/rates/getrate/:id', (req, res) => {
    const userID = parseInt(req.params.id, 10); 
    const data = readData();
    const rates = data.rates.filter(rate => rate.userID === userID);

    if(rates.length === 0){
        return res.json({message: 'User này chưa đánh giá cuốn sách nào...'})
    }
    res.json(rates);
});
// api post rate by userID and calc average of rage
app.post('/api/rates/create', (req, res) => {
    const {userID, bookID, rate} = req.body;

    if (!userID || !bookID || !rate) {
        return res.status(400).json({ message: 'Error from client' });
    }

    const data = readData();
    let rateExistIndex = data.rates.findIndex(rate => rate.userID === parseInt(userID) && rate.bookID === parseInt(bookID));
    if (rateExistIndex === -1) {
        const existingRateIDs = data.rates.map(rate => rate.rateID);
        let newRateID = 1;
            while (existingRateIDs.includes(newRateID)) {
                newRateID++;
            }
        const newRate = {
            rateID: newRateID,
            userID,
            bookID,
            rate: rate
        }
        data.rates.push(newRate);
        writeData(data);
        res.status(201).json({
            message: `Đánh giá cuốn sách này thành công!`,
            rate: newRate.rate
        });
    } else {
         const updateRate = {
            ...data.rates[rateExistIndex],
            rate: rate
        };
        data.rates[rateExistIndex] = updateRate;
        writeData(data);
        res.status(201).json({
            message: `Đánh giá cuốn sách này thành công!`,
            rate: rate
        });
    }
});
app.put('/api/rates/update', (req, res) => {
    const {userID, bookID, rate} = req.body;

    if (!userID || !bookID || !rate) {
        return res.status(400).json({ message: 'Error from client' });
    }

    const data = readData();
    let rateExistIndex = data.rates.findIndex(rate => rate.userID === parseInt(userID) && rate.bookID === parseInt(bookID));
    if (rateExistIndex === -1) {
        return res.status(404).json({message: "Not found"});
    }
        
    const updateRate = {
            ...data.rates[rateExistIndex],
            userID,
            bookID,
            rate: rate
        };
        data.rates[rateExistIndex] = updateRate;
        writeData(data);
        res.status(201).json({
            message: `Đánh giá cuốn sách này thành công!`,
            rate: rate
        });
});
// API to handle comment deletion
app.delete('/api/comments/:id', (req, res) => {
    const commentID = parseInt(req.params.id, 10);
    if (isNaN(commentID)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
    }
    const data = readData();
    const commentIndex = data.comments.findIndex(comment => comment.commentID === commentID);
    if (commentIndex === -1) {
        return res.status(404).json({ message: 'Comment not found' });
    }
    // Remove the comment from the data array
    data.comments.splice(commentIndex, 1);
    writeData(data);
    res.status(200).json({ message: 'Comment deleted successfully' });
});
// API sửa comment
app.put('/api/comments/:id', (req, res) => {
    const commentID = parseInt(req.params.id, 10);  
    const { contentEdited } = req.body; 
      if (!contentEdited) {
        return res.status(400).json({ message: 'Nội dung bình luận không được trống!' });
    }
    const data = readData();  
    const commentIndex = data.comments.findIndex(comment => comment.commentID === commentID);
    if (commentIndex === -1) {
        return res.status(404).json({ message: 'Bình luận không tồn tại!' });
    }

    data.comments[commentIndex].comment = contentEdited;
    const currentTime = new Date();
    data.comments[commentIndex].lastUpdate = formatDate(currentTime);
    writeData(data); 
    res.status(200).json({
        message: 'Bình luận đã được sửa thành công!',
        lastUpdate: data.comments[commentIndex].lastUpdate
    });
});
// api để lấy thông tin trong giỏ hàng của user
app.get('/api/cart/getAll/:id', (req, res) => {
    const userID = parseInt(req.params.id, 10);
    if (isNaN(userID)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    const data = readData();
    const user = data.users.find(user => user.userID === userID);
    if(!user){
        return res.status(404).json({message: 'User not found'});
    } else {
        const cartOfUser = data.cart.find(cart => cart.userID === userID);
        if(!cartOfUser){
             return res.status(404).json({message: 'Cart of user not found'});
        }
        const listBookIDInCart = cartOfUser.bookID;
        const listBookInfoFound = listBookIDInCart.map(bookID => {
            const bookFound = data.books.find(book => book.bookID === bookID);
            if(bookFound){
                return {
                bookID,
                imageLink: bookFound.imageLink,
                category: bookFound.category,
                title: bookFound.title
                };
            } else {
                return null;
            };
        }).filter(item => item !== null);
        res.status(200).json(listBookInfoFound);
    };
});
// API delele sách trong cart
app.delete('/api/cart/deleteItem', (req, res) => {
    const {userID, bookID, listBookID} = req.body;
    const data = readData();
    if(!userID || isNaN(userID)){
        return res.status(400).json({message: 'Không tồn tại người dùng'});
    } else {
        if(bookID && !listBookID){
            const cartOfUser = data.cart.find(cart => cart.userID === userID);
            if(!cartOfUser){
                return res.status(400).json({message: 'Không tồn tại giỏ hàng của người dùng'})
            } else {
                const arrayBookID = cartOfUser.bookID; 
                const indexBookIDToDelete = arrayBookID.findIndex(bookId => bookId === bookID);
                if(indexBookIDToDelete === -1) {
                    return res.status(400).json({message: 'Không tồn tại sách'});
                }
                arrayBookID.splice(indexBookIDToDelete, 1);
                writeData(data);
                return res.status(200).json({ message: 'Xóa thành công' });
            }   
        } else if(!bookID && listBookID){
            if (!Array.isArray(listBookID)) {
                return res.status(400).json({ message: 'Dữ liệu listBookID không hợp lệ' });
            }
            const cartOfUser = data.cart.find(cart => cart.userID === userID);
            if(!cartOfUser){
                return res.status(400).json({message: 'Không tồn tại giỏ hàng của người dùng'})
            };
            const arrayBookID = cartOfUser.bookID; 
            for(let i = arrayBookID.length - 1; i >= 0; i--){
                if(listBookID.includes(arrayBookID[i])){
                    arrayBookID.splice(i, 1);
                };
            };
            writeData(data);
            return res.status(200).json({ message: 'Xóa thành công' });
        } else {
            return res.status(400).json({message: 'Dữ liệu không hợp lệ'})
        }
    };

});
// API thêm sách vào cart
app.put('/api/cart/addItem', (req, res) => {
    const {userID, bookID} = req.body;
    if (!userID || !bookID) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    const data = readData();
    const cartOfUser = data.cart.find(cart => cart.userID === userID);
    if(!cartOfUser){
        return res.status(400).json({message: "Không tồn tại giỏ của người dùng"});
    }
    let listBookID = cartOfUser.bookID
    if(!listBookID){
        let listBookID = [];
        listBookID.push(bookID);
    } else {
        if(listBookID.includes(bookID)){
            return res.status(400).json({message: "Sách đã tồn tại trong giỏ"});
        }
        listBookID.push(bookID);
    }
    writeData(data);
    res.status(200).json({ message: 'Thêm thành công!' });
});
// API cập nhật profile
app.put('/api/users/update', (req, res) => {
    const {userID, name, address, phone} = req.body;

    if (!userID || !name || !address || !phone) {
        return res.status(400).json({ message: 'Thông tin gửi lên server bị lỗi' });
    }
    const data = readData();
    let userExistIndex = data.users.findIndex(user => user.userID === userID);
    if (userExistIndex === -1) {
        return res.status(404).json({message: "Không tìm thấy user trên database"});
    }       
    const updateUser = {
        ...data.users[userExistIndex],
        name: name,
        address: address,
        phone: phone
    };
    data.users[userExistIndex] = updateUser;
    writeData(data);
    res.status(200).json({
        message: `Cập nhật thông tin thành công!`,
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
