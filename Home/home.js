// show/hidden
const showMenu = (toggleId, navbarId, bodyId) => {
    const toggle = document.getElementById(toggleId),
        navbar = document.getElementById(navbarId),
        bodypadding = document.getElementById(bodyId);
    if (toggle && navbar) {
        toggle.addEventListener('click', () => {
            navbar.classList.toggle('show');
            toggle.classList.toggle('rotate');
            bodypadding.classList.toggle('expander');
        });
    }
};
showMenu('nav_toggle', 'navbar', 'body');

// color hover of navbar
const linkColor = document.querySelectorAll('.nav_link');
function colorLink() {
    linkColor.forEach(link => link.classList.remove('active'));
    this.classList.add('active');
}
linkColor.forEach(link => link.addEventListener('click', colorLink));

// dropdown menu profile
const dropDownProfile = (menuId, userpicId) => {
    const userpic = document.getElementById(userpicId),
        menuProfile = document.getElementById(menuId);
    if (userpic && menuProfile) {
        userpic.addEventListener('click', (e) => {
            e.stopPropagation();
            menuProfile.classList.toggle('active');
        });
        window.addEventListener('click', (e) => {
            if (!menuProfile.contains(e.target) && !userpic.contains(e.target)) {
                menuProfile.classList.remove('active');
            }
        });
    }
};
dropDownProfile('drop-menu-profile', 'userpic');

// set username from sessionStorage
const infoUser = JSON.parse(sessionStorage.getItem('infoUser'));
if (infoUser) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('username').textContent = `${infoUser.username}`;
    });
    sessionStorage.setItem('username', infoUser.username);
};
// resize input
const textarea = document.getElementById('cmt-input');
textarea.addEventListener('input', function () {
    this.style.height = 'auto'; 
    this.style.height = (this.scrollHeight) + 'px'; 
});
//function fetch data list book 
const listBook = document.getElementById("list-book");
async function fetchDataBooks() {
    const response = await fetch('http://localhost:3000/api/books/getall');
    if (!response.ok){
        throw new Error(`Error: ${response.status}`);
    };
    const data = await response.json();
    return data;
};

//function show list book
async function displayListBook(){
    try {
        const dataBooks = await fetchDataBooks();
        const dataToShow = dataBooks.slice(0, 10);
        listBook.innerHTML = "";
        dataToShow.forEach(book => {
            let quantityBookBorrowed = book.quantityTotal - book.quantityValid;
            const infoBook = `
                <li>
                    <div class="book-item">
                        <div class="book-top">
                            <a href="#" class="book-picture" onclick="showDetailsBook(${book.bookID})">
                                <img src="${book.pathPicture}" alt="Ảnh bìa sách">
                                <button class="view-detail">
                                    <h2>${book.title}</h2>
                                    <div class="status-rate">
                                        <li class="status-book">Status: Còn</li>
                                        <li class="rate-book">Rate: ${book.rateAverage} 
                                            <ion-icon name="star" class="icon-star"></ion-icon>
                                        </li>
                                    </div>
                                    <p class="content-preview"><b>Mô tả: </b>${book.description}</p>
                                    <p><b>ID: </b>${book.bookID}</p>
                                    <p><b>Thể loại: </b>${book.category}</p>
                                    <p><b>Tác giả: </b>${book.author}</p>
                                    <p><b>Bình luận:</b> ... (Click để xem chi tiết)</p>
                                </button> 
                            </a>
                            <span id="category">${book.category}</span>
                        </div>
                        <div class="book-info">
                            <h2>${book.title}</h3>
                            <p>Tác giả: ${book.author} </p>
                            <p>Đã mượn: ${quantityBookBorrowed}</p>
                            <p>Còn: ${book.quantityValid}</p>
                        </div>
                        <button type="button" class="add-to-cart">
                            <ion-icon name="cart" class="cart"></ion-icon>
                            Thêm Vào Giỏ
                        </button> 
                    </div>
                
                </li>
            `;
                listBook.innerHTML += infoBook;
        });
    } catch (error){
        console.error(error);
    };
};
displayListBook();
// function show details book
function showDetailsBook(bookID) {
    const bookDetails = document.querySelector(".see-book-details");
    bookDetails.classList.add("active");
    addDetailsByBookID(bookID);
    addContentCmtByBookID(bookID);
};
// function lấy rate mỗi cuốn sách do user hiện tại đánh giá
async function takeRateByUser(){
    try {
        const response = await fetch(`http://localhost:3000/api/rates/getrate/${infoUser.userID}`);
        if (!response.ok) throw new Error(`Error! Status: ${response.status}`);
        const data =  await response.json();
        sessionStorage.setItem('rateOfUser', JSON.stringify(data));
    } catch(error) {
        console.error(error);
    };
};
takeRateByUser();
const rateOfUser = JSON.parse(sessionStorage.getItem('rateOfUser'));
async function addDetailsByBookID(bookID){
     fetch(`http://localhost:3000/api/books/${bookID}`)
        .then(response => {
            if (!response.ok){
                throw new Error(`Error, Status: ${response.status}`);
            };
            return response.json();
        })
        .then(data => {
            if(data){
                const bookDetails = document.querySelector(".see-book-details.active");
                let detailsOverView = bookDetails.querySelector(".details-overview");
                detailsOverView.innerHTML = "";
                let detailsBook = `
                    <img src="${data.pathPicture}" id="picture-book" alt="Ảnh bìa sách">
                    <h2>${data.title}</h2>
                    <h3 id="rate-count"> 
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>
                        <ion-icon name="star" class="count-star"></ion-icon>        
                    </h3>
                    <p><b>Tác giả: </b>${data.author}</p>
                    <p><b>Thể loại: </b>${data.category}</p>
                    <p id="book-id"><b>ID: </b>${data.bookID}</p>
                    <p><b>Ngày xuất bản: </b>${data.publishDate}</p>
                    <p class="description-book"><b>Mô tả: </b>${data.description}</p>
                    <p>------------------------------------------------------------------------------------------</p>
                    <p><b>Bình luận:</b></p>
                `;
                detailsOverView.innerHTML += detailsBook;
                //function hover rate by userID, take rate by user
                const stars = document.querySelectorAll(".count-star");
                const rateOfBook = rateOfUser.find(r => r.bookID === bookID);
                let starToFillColor = 0;
                if(rateOfBook){
                    starToFillColor = parseInt(rateOfBook.rate);
                    for (let i = 0; i < starToFillColor; i++){
                        stars[i].style.color = `yellow`;
                    };
                };
                Array.from(stars).forEach((star, index) => {
                    const numberStar = index + 1;
                    star.addEventListener("mouseenter", () => {
                        for(let i = 0; i <= index; i++){
                            stars[i].style.color = 'yellow';
                        };
                    }); 
                    star.addEventListener("mouseleave", () => {
                        for(let i = 9; i > starToFillColor - 1; i--){
                            stars[i].style.color = 'gray';
                        };
                    });
                    star.addEventListener("click", async () => {
                        const dataToSend = {
                            userID: infoUser.userID,
                            bookID,
                            rate: numberStar
                        };
                        try {
                            const response = await fetch(`http://localhost:3000/api/rates/create`,{
                                method: 'POST',
                                headers: {'Content-Type':'application/json'},
                                body: JSON.stringify(dataToSend)
                            });
                            if (!response.ok) throw new Error(`Error! Status: ${response.status}`);
                            const dataReceive = await response.json();
                            starToFillColor = dataReceive.rate;
                            for(let i = 0; i < starToFillColor; i++){
                                stars[i].style.color = 'yellow';
                            };
                            for(let i = 9; i >= dataReceive.rate; i--){
                                stars[i].style.color = 'gray';
                            };
                        } catch (error) {
                            console.error(error);
                        };
                    });
                });
            };

        })
        .catch (error => console.error(error));
};
async function addContentCmtByBookID(bookID){
    try {
        const response = await fetch(`http://localhost:3000/api/comments/getcmt/${bookID}`);
        if (!response.ok){
            throw new Error(`Error, Status: ${response.status}`);
        };
        const data = await response.json();
        const dataSorted = data.sort((dataA, dataB) => {
            const dateA = moment(dataA.lastUpdate, "DD/MM/YYYY HH:mm:ss");
            const dateB = moment(dataB.lastUpdate, "DD/MM/YYYY HH:mm:ss");
            return dateA.isBefore(dateB) ? 1 : (dateA.isSame(dateB) ? 0 : -1);
        })
        const sectionContent = document.getElementById("section-content");
        sectionContent.innerHTML = "";
        dataSorted.forEach(comment => {
            const timeComment = moment(comment.lastUpdate, "DD/MM/YYYY HH:mm:ss");
            const timeAgo = timeComment.fromNow();
            let sectionCmt = `
                <li id="cmt-id-${comment.commentID}">
                     <div class="area-content-cmt">
                        <span class="avatar">
                            <img class="user-pic-cmt" src="${comment.pathPicture}">
                        </span>
                        <div class="cmt-content">
                            <p class="usernameF">${comment.username}
                                <span class="time-cmt" data-lastUpdate="${timeComment.format('DD/MM/YYYY HH:mm:ss')}">${timeAgo}</span>
                            </p>
                            <p id="content-cmt-id-${comment.commentID}">${comment.comment}</p>
                        </div>
                        <span class="chevron-icon" onclick="showMenuActions(${comment.commentID})">
                            <ion-icon name="chevron-down-outline"></ion-icon>
                        </span>
                        <button id="menu-${comment.commentID}"class="delete-edit-cmt">
                            <ul>
                                <li onclick="confirmDelete(${comment.commentID})">Xóa bình luận</li>
                                <li onclick="showButtonEdit(${comment.commentID})">Sửa bình luận</li>
                            </ul>
                        </button>
                    </div>    
                </li>    
            `;
            sectionContent.innerHTML += sectionCmt;
        });
        const updateAllTimeAgo = () => {
                const timeSpans = sectionContent.querySelectorAll('.time-cmt');
                timeSpans.forEach(timeSpan => {
                    const timeComment = moment(timeSpan.getAttribute('data-lastUpdate'), "DD/MM/YYYY HH:mm:ss");
                    const updatedTimeAgo = timeComment.fromNow();
                    timeSpan.textContent = updatedTimeAgo;
                });
        };
        setInterval(updateAllTimeAgo, 60000);
    }catch(error){
        console.error(error);
    };
};
document.querySelector(".close-section-icon").addEventListener("click", () => {
    const bookDetails = document.querySelector(".see-book-details");
    bookDetails.classList.remove("active");
})
//function POST comment
async function postComment(){
    const comment = {
        comment: document.getElementById("cmt-input").value,
        userID: infoUser.userID,
        bookID: parseInt(document.getElementById("book-id").textContent.replace('ID: ', ''))
    }
    try {
        const response = await fetch("http://localhost:3000/api/comments/post",{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(comment)
        });
        if (!response.ok) throw new Error(`Error, Status: ${response.status}`);
        const data = await response.json();
        const timeComment = moment(data.lastUpdate, "DD/MM/YYYY HH:mm:ss");
        const timeAgo = timeComment.fromNow();
        const newComment = document.createElement("li");
        newComment.innerHTML = `
            <li id="cmt-id-${comment.commentID}>
                 <div class="area-content-cmt">
                     <span class="avatar">
                        <img class="user-pic-cmt" src="${infoUser.pathPicture}">
                    </span>
                    <div class="cmt-content">
                        <p class="usernameF">${infoUser.username}
                            <span class="time-cmt" data-lastUpdate="${timeComment.format('DD/MM/YYYY HH:mm:ss')}">${timeAgo}</span>
                        </p>
                        <p>${comment.comment}</p>
                    </div>
                    <span class="chevron-icon"><ion-icon name="chevron-down-outline"></ion-icon></span>
                    <button class="delete-edit-cmt">
                        <ul>
                            <li>Xóa bình luận</li>
                            <li>Sửa bình luận</li>
                        </ul>
                    </button>
                </div>    
            </li>
           
        `;
        const commentList = document.getElementById("section-content");
        const firstcomment = commentList.firstChild;
        commentList.insertBefore(newComment, firstcomment);
        document.getElementById("cmt-input").value = "";
    } catch(error){
        console.error(error);
    };
};
const postCommentBtn = document.getElementById("text-post-cmt");
postCommentBtn.addEventListener("click", postComment);
function showMenuActions(commentID){
    Array.from(document.querySelectorAll('.delete-edit-cmt')).forEach(menuCmt => {
        menuCmt.style.display = 'none';
    });
    const menuComment = document.getElementById(`menu-${commentID}`);
    const isVisible = menuComment.dataset.visible === 'true';
    if (isVisible){
        menuComment.style.display = 'none';
        menuComment.dataset.visible = 'false';
    } else {
        menuComment.style.display = 'block';
        menuComment.dataset.visible = 'true';
    };

};
// function delete comments 
function confirmDelete(commentID) {
    const commentIDToDelete = commentID
    const confirmActions = document.getElementById(`confirm-actions`);
    confirmActions.style.display = 'block';
    const back = document.getElementById("back");
    back.addEventListener("click", () => {
        confirmActions.style.display = 'none';
    })
    const confirm = document.getElementById("confirm");
    confirm.addEventListener("click", () => {
        confirmActions.style.display = 'none';
        console.log(commentIDToDelete);
        deleteComment(commentIDToDelete);
    }, { once: true });
};
async function deleteComment(commentID){
    try {
        const response = await fetch(`http://localhost:3000/api/comments/${commentID}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Error, Status: ${response.status}`);
        const commentToDelete = document.getElementById(`cmt-id-${commentID}`);
        commentToDelete.remove();
    } catch (error) {
        console.error(error);
    };
};
function showButtonEdit(commentID){
    const contentComment = document.getElementById(`content-cmt-id-${commentID}`).textContent
    const contentToEdit = document.getElementById('content-to-edit');
    contentToEdit.innerText = contentComment;
    const buttonEdit = document.getElementById("btn-edit-content");
    buttonEdit.style.display = 'block';
    const back = document.getElementById("delete-action");
    back.addEventListener("click", () => {
        buttonEdit.style.display = 'none';
    })
    const confirm = document.getElementById("confirm-to-edit");
    confirm.addEventListener("click", () => {
        buttonEdit.style.display = 'none';
        console.log(commentID);
        editComment(commentID);
    }, { once: true });
};
async function editComment(commentID){
    const contentEdited = document.getElementById('content-to-edit').innerText;
    const dataToSend = {
        commentID,
        contentEdited
    }
    try {
        const response = await fetch(`http://localhost:3000/api/comments/${commentID}`, {
            method: 'PUT',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(dataToSend)
        });
        if(!response.ok) {
            throw new Error(`Error, Status: ${response.status}`);
        };
        const dataReceived = await response.json()
        const timeComment = moment(dataReceived.lastUpdate, "DD/MM/YYYY HH:mm:ss");
        const timeAgo = timeComment.fromNow();
        document.getElementById(`content-cmt-id-${commentID}`).innerText = dataToSend.contentEdited;
    } catch (error) {
        console.error(error);
    };
}






