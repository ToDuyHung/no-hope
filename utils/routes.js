'use strict';
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://chatbot:tmtchatbot@cluster0.jj9cp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var USERS = [];

class Routes{

	constructor(app,socket){
		this.app = app;
		this.io = socket;

		/* 
			Array to store the list of users along with there respective socket id.
		*/
		this.users = []; 
	}


	appRoutes(){

		this.app.get('/', (request,response) => {
			response.render('index');
		});

	}

	socketEvents(){

		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("history");
			dbo.collection("message").find({}).toArray(function(err, result) {
				if (err) throw err;
				// console.log(result);
				for (const ele in result) {
					// console.log(ele);
					USERS.push({
						id: ele,
						userName: result[ele]['userId']
					});
					console.log(USERS);
				}
				db.close();
			});
		});

		this.io.on('connection', (socket) => {

			socket.on('username', (userName) => {

				setTimeout(function () {}, 10000);
				this.users.push({
					id : socket.id,
					userName : userName
				});

				console.log(USERS);


				for (const ele in USERS) {
					this.users.push(USERS[ele]);
				}

				console.log(this.users);

				let len = this.users.length;
				len--;

				this.io.emit('userList',this.users,this.users[len].id); 
		});

		    socket.on('getMsg', (data) => {
		    	socket.broadcast.to(data.toid).emit('sendMsg',{
		    		msg:data.msg,
		    		name:data.name
		    	});
		    });

		    socket.on('disconnect',()=>{
		    	
		      	for(let i=0; i < this.users.length; i++){
		        	
		        	if(this.users[i].id === socket.id){
		          		this.users.splice(i,1); 
		        	}
		      	}
		      	this.io.emit('exit',this.users); 
		    });

		});

	}

	routesConfig(){
		this.appRoutes();
		this.socketEvents();
	}
}
module.exports = Routes;