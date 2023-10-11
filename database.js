const mysql = require('mysql2/promise');


class database{

	constructor(config){
		this.config = config;
		this.connection = null;
	}

	async connect(){
		try{
			this.connection = await mysql.createConnection({
				host: this.config.host,
				user: this.config.user,
				password: this.config.password,
				database: 'cribsurfer'
			});
		}catch (err){
			console.error('Unable to connect');
		}

	}

	  async disconnect() {
	    if (this.connection) {
	      await this.connection.end();
	      console.log('Disconnected from the database');
	    } else {
	      console.log('Not connected to any database');
	    }
	  }

	  async query(Query) {
	    if (this.connection) {
	      try {
		const [rows, fields] = await this.connection.execute(Query);
		return rows;
	      } catch (error) {
		console.error('Error executing query:', error);
		return null;
	      }
	    }
	    console.log('Not connected to the database');
	  }

	async retriveData(date){
		let store = {};
		let [FromDataBase, type] = await this.connection.query(`SELECT * FROM temp${date}`);
		for (let n of FromDataBase){
			store[n.RESERVATION_NUMBER] = n;
		}
		return store;
	}
}

module.exports = database;
