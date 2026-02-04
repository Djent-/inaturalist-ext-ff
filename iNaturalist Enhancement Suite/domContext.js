var oldFetch = window.fetch;
window.fetch = async (url, options) => {
    const response = await oldFetch(url, options);
	try {
		if (url.match(/^https:\/\/api.inaturalist.org\/v\d+\/computervision/i)) {
			const data = await response.clone().json();
			if (data) {
				let filename = null;
				if (options) {
					const formData = options.body;
					if (formData) {
						const file = formData.get('image');
						if (file) {
							filename = file.name;
						}
					}
				}

				const payload = { 
					detail: {
						data,
						filename
					}
				};

				document.dispatchEvent(
					new CustomEvent('computerVisionResponse', payload)
				);
			}
		} else {
			const observationMatch = url.match(/^https:\/\/api.inaturalist.org\/v\d+\/observations\/\d+/i);
			if (observationMatch) {
				const data = await response.clone().json();
				if (data && data.results && data.results.length && data.results[0]) {
					const payload = { 
						detail: {
							location: data.results[0].location
						}
					};

					document.dispatchEvent(
						new CustomEvent('observationFetch', payload)
					);
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
    
	return response;
};