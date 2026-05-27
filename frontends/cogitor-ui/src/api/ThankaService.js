export default class ThankaSevice {

	static async getData(PATH, address, auth) {
		let data = JSON.stringify({
				id: auth.id,
				login: auth.login,
				address: address
			})
		return fetch(PATH + "thanka/getThanka.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				//Authorization: "Bearer " + getAccessToken(),
			},
			body: data
		}).then((response) => {
			if (response.ok) {
				return Promise.resolve(response.json());
			} else {
				return Promise.reject(response.json());
			}
		});
	}

	static async getPreview(Id, Name, Desc, isPic) {
		let child = { id: Id, name: Name, desc: Desc, pic: isPic };
		return child;
	}

	static async getTableState(state) {
		return state;
	}

	static async getTableData(list) {
		return list;
	}

	static async getVersion(version) {
		return version;
	}

}
