const body = document.getElementById("body");
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
// show/hidden
const showMenu = (toggleId, navbarId, bodyId) => {
    const toggle = document.getElementById(toggleId),
        navbar = document.getElementById(navbarId),
        bodypadding = document.getElementById(bodyId);
    if (toggle && navbar) {
        toggle.addEventListener('click', () => {
            navbar.classList.toggle('show');
            toggle.classList.toggle('rotate');
            bodypadding.classList.toggle('expander')
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
        const imgElement = `
            <img src="${infoUser.imageLink}" class="user-pic-in">${infoUser.username}
        `
        document.getElementById('username').innerHTML = imgElement;
        // document.getElementById('profile-name').textContent = infoUser.name || "Chưa cập nhật";
        // document.getElementById('profile-phone').textContent = infoUser.phone || "Chưa cập nhật";
        // document.getElementById('profile-address').textContent = infoUser.address || "Chưa cập nhật";
        // document.getElementById('avt-in-profile').src = infoUser.imageLink || "/Assets/user0.png";

    });
    sessionStorage.setItem('infoUser', JSON.stringify(infoUser));
};

// Load user data into the table
const API = "http://localhost:8081/api";
// Các tham số phân trang
let currentPage = 1;
let pageSize = 5;  // Số lượng user mỗi trang
// Hàm load dữ liệu từ api
function loadUsers() {
    fetch(`${API}/auth/getAll`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(users => {
            // Tính toán phân trang 
            const totalItems = users.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, totalItems);
            const currentPageData = users.slice(startIndex, endIndex);

            // Hiển thị dữ liệu
            renderTable(currentPageData);

            // Hiển thị phân trang
            renderPagination(totalPages);
        })
        .catch(error => console.error('Error loading users:', error));
}
// Hàm render bảng
function renderTable(data) {
    const tableBody = document.querySelector("#userTable tbody");
    tableBody.innerHTML = ''; // Xóa bảng cũ trước khi vẽ lại
    data.forEach(item => {
        const row = document.createElement("tr");
        row.id = `${item.userID}`
        row.innerHTML = `
            <td>${item.userID}</td>
            <td>${item.username}</td>
            <td>${item.email}</td>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td>${item.address}</td>
            <td>
                <button onclick="viewUserDetails(${item.userID})">Xem</button>
                <button onclick="deleteUser(${item.userID})">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
// Hàm render phân trang
function renderPagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ''; // Xóa các nút phân trang cũ
    // Tạo các nút phân trang
    for (let page = 1; page <= totalPages; page++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = page;
        pageButton.disabled = (page === currentPage); // Đặt disabled cho trang hiện tại
        pageButton.addEventListener("click", () => {
            currentPage = page;  // Chuyển đến trang đã chọn
            loadUsers();          // Gọi lại loadUsers để cập nhật bảng và phân trang
        });
        paginationContainer.appendChild(pageButton);
    }
}
// Gọi hàm loadUsers khi trang tải xong
document.addEventListener("DOMContentLoaded", loadUsers);
// Delete a user
async function deleteUser(userID) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
        const response = await fetch(`${API}/users/${userID}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete user");
        notification("Xóa thành công", true);
        loadUsers(); // Reload the table
    } catch (error) {
        console.error("Error deleting user:", error);
        notification("Xóa thất bại", false);
    }
}
async function viewUserDetails(userID) {
    try{
        const response = await  fetch(`${API}/auth/getAll`);
        if(!response.ok) throw new Error(`Error! Status: ${response.status}`);
        const dataReceive = await response.json();
        const user = dataReceive.find(u => u.userID === userID);
            if (user) {
                document.getElementById("userId").textContent = user.userID;
                document.getElementById("userName").textContent = user.username;
                const responseBorrows = await fetch(`${API}/borrowed-books/user/${userID}`);
                if(!responseBorrows.ok) throw Error(`Error! Status: ${responseBorrows.status}`);
                const dataBorrows = await responseBorrows.json();
                const booksTableBody = document.querySelector("#borrowedBooksTable tbody");
                booksTableBody.innerHTML = "";
                if (!dataBorrows || dataBorrows.length === 0) {
                    booksTableBody.innerHTML = "<tr><td colspan='6'>Người dùng hiện tại không có sách đang mượn.</td></tr>";
                    document.getElementById("findbook").addEventListener("click", function() {
                        findBorrowedBook(userID) // Truyền tham số vào phương thức A khi click
                    });
                    document.getElementById("userDetailsModal").style.display = "flex";
                } else {
                    dataBorrows.forEach(book => {
                        console.log(book.dueDate);
                        const row = document.createElement("tr");
                        row.id=`borrow-id-${book.borrowID}`;
                        row.innerHTML = `
                            <td>${book.borrowID}</td>
                            <td>${book.bookID}</td>
                            <td>${book.title}</td>
                            <td>${book.borrowDate}</td>
                            <td>${book.dueDate}</td>
                            <td>
                            <button onclick="removeBorrowedBook(${book.borrowID},'${book.dueDate}')">Trả</button>
                            </td>
                        `;
                        booksTableBody.appendChild(row);
                        });
                    document.getElementById("findbook").addEventListener("click", function() {
                        findBorrowedBook(userID) // Truyền tham số vào phương thức A khi click
                    });
                    document.getElementById("userDetailsModal").style.display = "flex";
                } 
            } else {
                throw new Error("User not found!");
            }
    } catch(error){
        console.error(error);
        notification(`Có lỗi: ${error.status}`, false);
    }
}
// Close modal
const closeDetailsUser = document.getElementById("close-modal");
closeDetailsUser.addEventListener("click", (e) => {
    document.getElementById("userDetailsModal").style.display = "none";
});

// Xử lý nút Trả
function removeBorrowedBook(borrowID, dueDate) {
    if (!confirm("Bạn có chắc chắn muốn trả cuốn sách này không?")) return;
    console.log(dueDate);
    const currentDate = moment();
    const dueDateObj = moment(dueDate, 'YYYY-MM-DD');
    let lateDays = dueDateObj.diff(currentDate, 'days');
    fetch(`${API}/borrowBooks/${borrowID}`, {
        method: "DELETE",
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error Status ${response.status}`);
            }
            console.log(lateDays);
            if (lateDays < 0) {
                notification(`Số ngày trễ hạn: ${-lateDays} ngày.`, false);
            } else {
                notification("Trả sách đúng hạn. Cảm ơn bạn!", true)
            }
            document.getElementById(`borrow-id-${borrowID}`).remove();
        })
        .catch(error => {
            console.error(error);
            notification(`Có lỗi: ${error}`, false);
        });

}
function findBorrowedBook(userID) {
    const bookID = document.getElementById("searchBook").value.trim();
    if (!bookID) {
        alert("Vui lòng nhập Mã sách!");
        return;
    }
    // Gọi API để lấy thông tin sách
    fetch(`${API}/books/detail/${bookID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Không tìm thấy sách với mã đã nhập!");
            }
            return response.json();
        })
        .then(book => {
            if (!book) {
                alert("Không tìm thấy sách!");
                return;
            }
            // Hiển thị thông tin sách trong modal
			console.log(book);
            displayBookDetails(book,userID);
			
        })
        .catch(error => {
            console.error("Error fetching book data:", error);
            notification("Không tìm thấy sách này trong kho", false);
        });
}

function displayBookDetails(book, userID) {
    const bookModal = document.querySelector(".see-book-details");
    bookModal.innerHTML = "";

    const modalContent = `
        <div class="details-overview" id="details-overview">
            <img src="${book.imageLink}" id="picture-book" alt="Ảnh bìa sách">
            <p><b>ID: </b>${book.bookID}</p>
            <p><b>Tên sách: </b>${book.title}</p>
            <p><b>Tác giả: </b>${book.author}</p>
            <p><b>Thể loại: </b>${book.category}</p>
            <p><b>Ngày xuất bản: </b>${book.publishDate}</p>
            <p><b>Số lượng trong kho: </b>${book.quantityValid}</p>
            <p class="description-book"><b>Mô tả: </b>${book.description}</p>
        </div>
        <button onclick="addBorrowedBook(${userID}, ${book.bookID}, ${book.quantityValid})">Mượn</button>
    `;
    bookModal.innerHTML += modalContent;
    document.getElementById("title-details-book").style.display = 'block';
    bookModal.classList.add("active");
    document.querySelector(".overlay").classList.add("active");
}
const iconCloseModal = document.getElementById("close-details-book");
iconCloseModal.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector('.see-book-details').classList.remove("active");
    document.getElementById("title-details-book").style.display = 'none';
    document.querySelector(".overlay").classList.remove("active");
})

async function addBorrowedBook(userID, bookID, quantityValid) {
    if(quantityValid > 0){
        const currentDate = moment();
        const borrowDate = currentDate.format("YYYY-MM-DD");
        const futureDate = currentDate.add(30, 'days');
        const dueDate = futureDate.format("YYYY-MM-DD");
        const dataToSendServer = {
            bookID,
            userID,
            borrowDate,
            dueDate
        }
        console.log(dataToSendServer);
        try {
            // Lấy borrowID từ server
            const response = await fetch(`${API}/borrowed-books/addborrowBook`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(dataToSendServer)
        });
            if (!response.ok) {
                throw new Error(`Error! Status: ${response.status}`);
            }
            const dataReceived = await response.json();
            document.querySelector(".see-book-details").classList.remove("active");
            document.getElementById("title-details-book").style.display = 'none';
            document.getElementById("overlay").classList.remove("active");
            // Thêm hàng mới vào bảng
            const booksTableBody = document.querySelector("#borrowedBooksTable tbody");
            if(booksTableBody.innerHTML === "<tr><td colspan='6'>Người dùng hiện tại không có sách đang mượn.</td></tr>"){
                booksTableBody.innerHTML = "";
            }
            const row = document.createElement("tr");
            row.id = `borrow-id-${dataReceived.borrowID}`;
            row.innerHTML = `
                <td>${dataReceived.borrowID}</td>
                <td>${dataReceived.bookID}</td>
                <td>${dataReceived.title}</td>
                <td>${dataReceived.borrowDate}</td>
                <td>${dataReceived.dueDate}</td>
                <td>
                    <button onclick="removeBorrowedBook(${dataReceived.borrowID}, '${dataReceived.dueDate}')">Trả</button>
                </td>
            `;
            booksTableBody.appendChild(row);

        
            } catch (error) {
            console.error("Error:", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại sau!");
        }
    } else {
        notification("Số lượng sách này trong kho đã hết!", false);
    }
}

// Search for users by ID or Name 
function searchUser() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    fetch(`${API}/auth/getAll`)
        .then(response => response.json())
        .then(users => {
            // Lọc dữ liệu theo query (ID hoặc Name)
            const filteredData = users.filter(item =>
                item.userID.toString().includes(query) || item.name.toLowerCase().includes(query)
            );
            // Tính toán phân trang 
            const totalItems = filteredData.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, totalItems);
            const currentPageData = filteredData.slice(startIndex, endIndex);
            // Hiển thị dữ liệu
            renderTable(currentPageData);

            // Hiển thị phân trang
            renderPagination(totalPages);
        })
        .catch(error => {
            console.error('Error searching users:', error);
        });
}
document.getElementById("searchInput").addEventListener("input", (e) => {
    e.preventDefault();
    searchUser();
})
