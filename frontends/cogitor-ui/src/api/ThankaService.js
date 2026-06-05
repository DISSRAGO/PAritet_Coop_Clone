export default class ThankaSevice {

	static async getData(PATH, address, auth) {
		let data = JSON.stringify({
				id: auth.id,
				login: auth.login,
				// Stage 3 PR 4: subject_id — канонический ключ владельца.
				// Бэк get_thanka_endpoint пробрасывает его в SOAP-params (приоритет над login).
				subject_id: auth.subjectId || "",
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
