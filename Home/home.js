// noti-login
const body = document.getElementById("body");
window.onload = function() {
    const notification = document.getElementById('notification');
    const isLogin = sessionStorage.getItem("isLogin");
    if(isLogin){
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3500); 
        sessionStorage.removeItem("isLogin");
    }
};
function notification(content, isSuccess){
    const notification = document.getElementById('notification');
    if(isSuccess){
        notification.innerHTML = `
            <ion-icon name="checkmark-outline"></ion-icon> ${content}
        `;
        notification.style.backgroundColor = `#41eea0`;
        notification.style.color = 'black';
    } else {
        notification.innerHTML = `
            <ion-icon name="alert-circle-outline"></ion-icon> ${content}
        `;
        notification.style.backgroundColor = `red`;
        notification.style.color = '#ededed';
    }
    setTimeout(() => {
        notification.classList.add('show');
    }, 0);
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3500); 
}
// function search book
let timeout;
const handleSearchInput = () => {
    clearTimeout(timeout);
    timeout = setTimeout( async () => {
        const searchTerm = document.getElementById("search-info").value.toLowerCase().trim();
        try {
            const response = await fetch('http://localhost:8080/api/books/allbooks');
            if (!response.ok){
                throw new Error(`Error: ${response.status}`);
            };
            const books = await response.json();
            const bookFound = books.filter(book => {
                const bookID = book.bookID ? book.bookID.toString().toLowerCase() : ""; 
                const title = book.title ? book.title.toLowerCase() : ""; 
                const category = book.category ? book.category.toLowerCase() : ""; 
                const author = book.author ? book.author.toLowerCase() : "";
                return (
                    bookID.includes(searchTerm) ||
                    title.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    author.includes(searchTerm)
                );
            });
            displayListBook(bookFound);
        } catch(error){
            console.error(error);
        }
    }, 400); 
};
document.getElementById("icon-search").addEventListener("click", handleSearchInput);
document.getElementById("search-info").addEventListener("input", handleSearchInput);
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
            const inCart = document.getElementById("in-cart");
            const titleCart = document.getElementById("title-cart");
            const titleListBorrow = document.getElementById("title-list-borrow");
            const inListBorrow = document.getElementById("in-list-borrow");
            if (bodypadding.classList.contains("expander")){
                inCart.style.width = '90%';
                titleCart.style.width = '90%';
                inListBorrow.style.width = '90%';
                titleListBorrow.style.width = '90%';
            } else {
                inCart.style.width = '80%';
                titleCart.style.width = '80%';
                inListBorrow.style.width = '80%';
                titleListBorrow.style.width = '80%';
            };
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
        document.getElementById('username').textContent = infoUser.username;
        document.getElementById('profile-name').textContent = infoUser.name || "Chưa cập nhật";
        document.getElementById('profile-phone').textContent = infoUser.phone || "Chưa cập nhật";
        document.getElementById('profile-address').textContent = infoUser.address || "Chưa cập nhật";
        document.getElementById('avt-in-profile').src = infoUser.imageLink;

    });
    sessionStorage.setItem('infoUser', JSON.stringify(infoUser));
};
// update profile
const updateProfileBtn = document.getElementById("update-profile");
updateProfileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const profileName = document.getElementById("profile-name");
    const profilePhone = document.getElementById("profile-phone");
    const profileAddress = document.getElementById("profile-address");
    if(updateProfileBtn.innerText === "Cập nhật"){
        profileName.contentEditable = "true";
        profileAddress.contentEditable = "true";
        profilePhone.contentEditable = "true";

        profileName.style.backgroundColor = "#dedede";
        profileAddress.style.backgroundColor = "#dedede";
        profilePhone.style.backgroundColor = "#dedede";

        profileName.style.color = "black";
        profileAddress.style.color = "black";
        profilePhone.style.color = "black";
        updateProfileBtn.innerText = "Lưu";
    } else {
        profileName.contentEditable = "false";
        profileAddress.contentEditable = "false";
        profilePhone.contentEditable = "false";

        profileName.style.backgroundColor = "#333";
        profileAddress.style.backgroundColor = "#333";
        profilePhone.style.backgroundColor = "#333";

        profileName.style.color = "#dedede";
        profileAddress.style.color = "#dedede";
        profilePhone.style.color = "#dedede";
        updateProfileBtn.innerText = "Cập nhật";

        const dataToSend = {
            userID: infoUser.userID,
            name: profileName.innerText,
            address: profileAddress.innerText,
            phone: profilePhone.innerText
        }
        console.log(dataToSend);
        fetch(`http://localhost:8080/api/users/update`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dataToSend)
        })
        .then(response => {
            if(!response.ok) throw new Error(`Error! Status: ${response.status}`);
            notification("Cập nhật thành công!", true);
        })
        .catch(error => {
            console.error(error);
            notification("Cập nhật thất bại!", false);
        });
    };
    
});
// resize input
const textarea = document.getElementById('cmt-input');
textarea.addEventListener('input', function () {
    this.style.height = 'auto'; 
    this.style.height = (this.scrollHeight) + 'px'; 
});
//function fetch data list book 
const listBook = document.getElementById("list-book");
async function fetchDataBooks() {
    try {
        const response = await fetch('http://localhost:8080/api/books/allbooks');
        if (!response.ok){
            throw new Error(`Error: ${response.status}`);
        };
        const data = await response.json();
        displayListBook(data);
    } catch(error){
        console.error(error);
    }
};

fetchDataBooks();
//function show list book
function displayListBook(bookToDisplay){
        listBook.innerHTML = "";
        bookToDisplay.forEach(book => {
            let quantityBookBorrowed = book.quantityTotal - book.quantityValid;
            console.log(book.rate)
            const infoBook = `
                <li>
                    <div class="book-item">
                        <div class="book-top">
                            <a href="#" class="book-picture" onclick="showDetailsBook(${book.bookID})">
                                <img src="${book.imageLink}" alt="Ảnh bìa sách">
                                <button class="view-detail">
                                    <h2>${book.title}</h2>
                                    <div class="status-rate">
                                        <li class="status-book">Status: Còn</li>
                                        <li class="rate-book">Rate: ${parseFloat(book.rate)} 
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
                        <button type="button" class="add-to-cart" onclick="addItemToCart(${book.bookID})">
                            <ion-icon name="cart" class="cart"></ion-icon>
                            Thêm Vào Giỏ
                        </button> 
                    </div>
                
                </li>
            `;
                listBook.innerHTML += infoBook;
        });
};
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
        const response = await fetch(`http://localhost:8080/api/rates/getrate/${infoUser.userID}`);
        if (!response.ok) throw new Error(`Error! Status: ${response.status}`);
        const data =  await response.json();
        sessionStorage.setItem('rateOfUser', JSON.stringify(data));
    } catch(error) {
        console.error(error);
        notification(error.message, false);
    };
};
takeRateByUser();
const rateOfUser = JSON.parse(sessionStorage.getItem('rateOfUser'));
async function addDetailsByBookID(bookID){
     fetch(`http://localhost:8080/api/books/${bookID}`)
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
                    <img src="${data.imageLink}" id="picture-book" alt="Ảnh bìa sách">
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
                document.getElementById("overlay").classList.add("active");
                body.classList.add("no-scroll");
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
                            const response = await fetch(`http://localhost:8080/api/rates/create`,{
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
                            notification("Gửi đánh giá thành công!", true);
                        } catch (error) {
                            console.error(error);
                            notification(error.message, false);
                        };
                    });
                });
            };

        })
        .catch (error => {
            console.error(error);
            notification(error.message, false);
        });
};
async function addContentCmtByBookID(bookID){
    try {
        const response = await fetch(`http://localhost:8080/api/comments/getcmt/${bookID}`);
        if (!response.ok){
            throw new Error(`Error, Status: ${response.status}`);
        };``
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
                            <img class="user-pic-cmt" src="${comment.imageLink}">
                        </span>
                        <div class="cmt-content">
                            <p class="usernameF" data-id="${comment.userID}">${comment.username}
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
            if(infoUser.userID !== comment.userID){
                document.getElementById(`menu-${comment.commentID}`).innerHTML = `
                    <ul>
                        <li onclick="hiddenComment(${comment.commentID})">Ẩn bình luận</li>
                        <li onclick="showComment(${comment.commentID}, '${comment.comment}')">Hoàn tác</li>
                    </ul>
                `
            }
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
        notification(error.message, false);
    };
};
document.querySelector(".close-section-icon").addEventListener("click", () => {
    const bookDetails = document.querySelector(".see-book-details");
    bookDetails.classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    body.classList.remove("no-scroll");
})
//function POST comment
async function postComment(){
    const comment = {
        comment: document.getElementById("cmt-input").value,
        userID: infoUser.userID,
        bookID: parseInt(document.getElementById("book-id").textContent.replace('ID: ', ''))
    }
    try {
        const response = await fetch("http://localhost:8080/api/comments/post",{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(comment)
        });
        if (!response.ok) throw new Error(`Error, Status: ${response.status}`);
        const data = await response.json();
        console.log(data)
        const timeComment = moment(data.lastUpdate, "DD/MM/YYYY HH:mm:ss");
        const timeAgo = timeComment.fromNow();
        const newComment = document.createElement("li");
        newComment.id = `cmt-id-${data.commentID}`;
        newComment.innerHTML = `
                 <div class="area-content-cmt">
                     <span class="avatar">
                        <img class="user-pic-cmt" src="${infoUser.imageLink}">
                    </span>
                    <div class="cmt-content">
                        <p class="usernameF" data-id="${infoUser.userID}">${infoUser.username}
                            <span class="time-cmt" data-lastUpdate="${timeComment.format('DD/MM/YYYY HH:mm:ss')}">${timeAgo}</span>
                        </p>
                        <p id="content-cmt-id-${data.commentID}">${comment.comment}</p>
                    </div>
                    <span class="chevron-icon" onclick="showMenuActions(${data.commentID})">
                        <ion-icon name="chevron-down-outline"></ion-icon>
                    </span>
                    <button id="menu-${data.commentID}"class="delete-edit-cmt">
                        <ul>
                            <li onclick="confirmDelete(${data.commentID})">Xóa bình luận</li>
                            <li onclick="showButtonEdit(${data.commentID})">Sửa bình luận</li>
                        </ul>
                    </button>
                </div>     
        `;
        notification("Gửi bình luận thành công!", true);
        const commentList = document.getElementById("section-content");
        const firstcomment = commentList.firstChild;
        commentList.insertBefore(newComment, firstcomment);
        document.getElementById("cmt-input").value = "";
    } catch(error){
        console.error(error);
        notification(error.message, false);
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
const hiddenComment = (commentID) => {
            const commentToHidden = document.getElementById(`content-cmt-id-${commentID}`);
            commentToHidden.innerText = 'Bình luận này đã bị ẩn đi';
            commentToHidden.style.color = '#444';
            const menuComment = document.getElementById(`menu-${commentID}`);
            menuComment.style.display = 'none';
            menuComment.dataset.visible = 'false';
};
const showComment = (commentID, contentComment) => {
            const commentToShow= document.getElementById(`content-cmt-id-${commentID}`);
            commentToShow.innerText = contentComment;
            commentToShow.style.color = '#ededed';
            const menuComment = document.getElementById(`menu-${commentID}`);
            menuComment.style.display = 'none';
            menuComment.dataset.visible = 'false';
};
async function deleteComment(commentID){
    try {
        const response = await fetch(`http://localhost:8080/api/comments/${commentID}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Error, Status: ${response.status}`);
        const commentToDelete = document.getElementById(`cmt-id-${commentID}`);
        commentToDelete.remove();
        notification("Xóa bình luận thành công!", true);
    } catch (error) {
        console.error(error);
        notification(error.message, false);
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
        editComment(commentID, contentComment);
    }, { once: true });
       const menuComment = document.getElementById(`menu-${commentID}`);
        menuComment.style.display = 'none';
        menuComment.dataset.visible = 'false';
};
async function editComment(commentID, oldComment){
    const contentEdited = document.getElementById('content-to-edit').innerText;
    console.log(oldComment, contentEdited)
    if(oldComment === contentEdited){
        return;
    } else {
        const dataToSend = {
        commentID,
        contentEdited
        };
        try {
            const response = await fetch(`http://localhost:8080/api/comments/${commentID}`, {
                method: 'PUT',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(dataToSend)
            });
            if(!response.ok) {
                throw new Error(`Error, Status: ${response.status}`);
            };
            const dataReceived = await response.json()
            const lastUpdate = moment(dataReceived.lastUpdate, "DD/MM/YYYY HH:mm:ss");
            const timeAgo = lastUpdate.fromNow();
            const commentUpdate = document.getElementById(`cmt-id-${commentID}`);
            const timeUpdate = commentUpdate.querySelector('.time-cmt');
            timeUpdate.innerText = timeAgo;
            timeUpdate.setAttribute('data-lastUpdate', `${lastUpdate.format('DD/MM/YYYY HH:mm:ss')}`)
            document.getElementById(`content-cmt-id-${commentID}`).innerText = dataToSend.contentEdited;
            notification("Sửa bình luận thành công!", true);
        } catch (error) {
            console.error(error);
            notification(error.message, false);
        };
    }; 
};

//function chọn sách trong cart để mượn
function pickElementInCart(bookID, button){
    const bookPicked = document.getElementById(`book-inCart-${bookID}`);
    if(button.innerText === "Chọn"){
        bookPicked.style.backgroundColor = '#91a897';
        bookPicked.querySelector(".input-quantity-inCart").style.backgroundColor ='#91a897';
        bookPicked.setAttribute("data-boolean", "1");
        button.innerText = "Bỏ chọn";
    }else {
        bookPicked.style.backgroundColor = '#dedede';
        bookPicked.querySelector(".input-quantity-inCart").style.backgroundColor ='#dedede';
        bookPicked.setAttribute("data-boolean", "0");
        button.innerText = "Chọn";
    } 
};
//function chọn tất cả sách trong cart
function pickAllElementInCart(button){
    const allBookToPick = document.getElementById("table-body-cart").querySelectorAll("tr");
    if(button.innerText === "Chọn tất cả"){
        Array.from(allBookToPick).forEach(row => {
            row.style.backgroundColor = "#91a897";
            row.setAttribute("data-boolean", "1");
            row.querySelector(".input-quantity-inCart").style.backgroundColor ='#91a897';
        });
        button.innerText = "Bỏ chọn tất";
    } else {
        Array.from(allBookToPick).forEach(row => {
            row.style.backgroundColor = "#dedede";
            row.setAttribute("data-boolean", "0");
            row.querySelector(".input-quantity-inCart").style.backgroundColor ='#dedede';
        });
        button.innerText = "Chọn tất cả";
    };
};
//function xóa 1 quyển sách đã thêm vảo giỏ
async function deleteElementInCart(bookID){
    const bookToDelete = document.getElementById(`book-inCart-${bookID}`);
    const dataToSend = {
        userID: infoUser.userID,
        bookID
    };
    try {
        const response = await fetch(`http://localhost:8080/api/cart/deleteItem`, {
            method: 'DELETE',
            headers:  {'Content-Type' : 'application/json'},
            body: JSON.stringify(dataToSend)
        });
        if (!response.ok) throw new Error(`Error! Status: ${response.status}`);
        bookToDelete.remove();
        const countItem = parseInt(document.getElementById("cart-count-book").innerText, 10);
        document.getElementById("cart-count-book").innerText = countItem - 1;
        notification("Xóa thành công", true);
    } catch (error){
        console.error(error);
        notification("Xóa thất bại", false);
    };
};
//function xóa nhiều (xóa những sách đã chọn)
async function deleteElementsInCart(){
    const allBookToDelete = document.getElementById("table-body-cart").querySelectorAll("tr");
    const bookIDToSend = Array.from(allBookToDelete).map(row => {
        const dataBoolean = parseInt(row.getAttribute("data-boolean"), 10);
        const dataID = parseInt(row.getAttribute("data-id"), 10);
        if (dataBoolean){
            return dataID;
        } else {
            return null;
        }
    }).filter(item => item !== null);
    const dataToSend = {
        userID: infoUser.userID,
        listBookID: bookIDToSend
    }
    console.log(dataToSend);
    try {
        const response = await fetch(`http://localhost:8080/api/cart/deleteItem`, {
            method: 'DELETE',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(dataToSend)
        });
        if (!response.ok){
            throw new Error(`Error! Status: ${response.status}`);
        }
        bookIDToSend.forEach(bookID => {
            document.getElementById(`book-inCart-${bookID}`).remove();
        })
        const countItem = parseInt(document.getElementById("cart-count-book").innerText, 10);
        document.getElementById("cart-count-book").innerText = countItem - bookIDToSend.length;
        notification("Xóa thành công", true);
    } catch(error){
        console.error(error);
        notification("Xóa thất bại", false);
    }
};
//function xem thông tin trong giỏ 
async function showInfoInCart(){
    try{
        const response = await fetch(`http://localhost:8080/api/cart/getAll/${infoUser.userID}`);
        if(!response.ok){
            throw new Error(`Error! Status: ${response.status}`);
        };
        const dataReceived = await response.json();
        const tableBodyCart = document.getElementById("table-body-cart");
        tableBodyCart.innerHTML = "";
        dataReceived.forEach(cart => {
            const row = `
                    <tr data-boolean="0" data-id="${cart.bookID}" id="book-inCart-${cart.bookID}">
                        <td>${cart.bookID}</td>
                        <td><img src="${cart.imageLink}" class="picture-book-inCart"></td>
                        <td>${cart.title}</td>
                        <td>${cart.category}</td>
                        <td>
                            <button onclick="deleteElementInCart(${cart.bookID})">Xóa</button>
                            <button onclick="pickElementInCart(${cart.bookID}, this)">Chọn</button>
                        </td>
                    </tr>
                `;  
            tableBodyCart.innerHTML += row;
        });
        document.getElementById("cart-count-book").innerText = dataReceived.length;
    }catch(error){
        console.log(error);
    };
};
showInfoInCart();
// đóng/mở cart

const closeCartBtn = document.getElementById("close-cart");
const inCart = document.getElementById("in-cart");
const iconCart = document.getElementById("cart-icon");
const titleCart = document.getElementById("title-cart");
iconCart.addEventListener("click", () => {
    inCart.classList.add("active");
    titleCart.classList.add("active");
    document.getElementById("overlay").classList.add("active");
    body.classList.add("no-scroll");
})
closeCartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    inCart.classList.remove("active");
    titleCart.classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    body.classList.remove("no-scroll");
});
//đóng mở profile
const closeProfileBtn = document.getElementById("close-profile");
const inProfile = document.getElementById("in-profile");
const iconProfile = document.getElementById("profile-icon");
const titleProfile = document.getElementById("title-profile");
iconProfile.addEventListener("click", () => {
    inProfile.style.display = "block";
    titleProfile.style.display = "block";
    document.getElementById("overlay").classList.add("active");
    body.classList.add("no-scroll");
    document.getElementById("drop-menu-profile").classList.remove("active");
})
closeProfileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    inProfile.style.display = "none";
    titleProfile.style.display = "none";
    document.getElementById("overlay").classList.remove("active");
    body.classList.remove("no-scroll");
});
// xem danh sách mượn (đóng / mở)
const closeListBorrowBtn = document.getElementById("close-list-borrow");
const inListBorrow = document.getElementById("in-list-borrow");
const textViewListBorrow = document.getElementById("text-view-list-borrow");
const titleListBorrow = document.getElementById("title-list-borrow");
textViewListBorrow.addEventListener("click", () => {
    inListBorrow.style.display = "block";
    titleListBorrow.style.display = "block";
    document.getElementById("overlay").classList.add("active");
    body.classList.add("no-scroll");
    document.getElementById("drop-menu-profile").classList.remove("active");
})
closeListBorrowBtn.addEventListener("click", (e) => {
    e.preventDefault();
    inListBorrow.style.display = "none";
    titleListBorrow.style.display = "none";
    document.getElementById("overlay").classList.remove("active");
    body.classList.remove("no-scroll");
});
//function thêm sách vào giỏ
async function addItemToCart(bookID){
    const dataToSend = {
        userID: infoUser.userID,
        bookID
    }
    console.log(dataToSend)
    try {
        const response = await fetch(`http://localhost:8080/api/cart/addItem`, {
            method: 'PUT',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(dataToSend)
        });
        if (!response.ok) {
            const dataReceived = await response.json();
            throw new Error(`${dataReceived.message}`)
        };
        const dataReceived = await response.json();
        notification("Thêm sách vào giỏ công!", true)
        showInfoInCart();
    } catch (error){
        console.error(error);
        notification(error.message, false);
    };
};
// function add danh sách đang mượn vào bảng
async function FetchDataBorrows(){
    try {
        const response = await fetch(`http://localhost:8080/api/borrows/getAll/${infoUser.userID}`);
        if(!response.ok) throw new Error(`Error! Status: ${response.status}`);
        const dataReceive = await response.json();
        dataReceive.forEach(data => {
            const tableBody = document.getElementById("table-body-list-borrow");
            
            const row = `
                <tr>
                    <td>${data.bookID}</td>
                    <td><img src="${data.imageLink}" class="picture-book-borrow"></td>
                    <td>${data.title}</td>
                    <td>${data.borrowDate}</td>
                    <td>${data.dueDate}</td>
                    <td id="status-${data.borrowID}"></td>
                </tr>  
            `
            tableBody.innerHTML += row;
            const dueDate = moment(data.dueDate, "DD/MM/YYYY");
            const currenDate = moment();
            const statusBorrow = document.getElementById(`status-${data.borrowID}`);
            if(dueDate.isBefore(currenDate) || dueDate.isSame(currenDate)){
                statusBorrow.innerText = "Đã đến hạn";
                statusBorrow.style.color = "red";
            } else {
                statusBorrow.innerText = "Chưa đến hạn";
                statusBorrow.style.color = "black";
            };
        });
    }catch(error){
        console.error(error);
    }
};
FetchDataBorrows();









