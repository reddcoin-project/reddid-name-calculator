var exports = {};
costing = exports;

COIN = 0.00000001;

(function (exports) {
	var priv = {
		nameCostUnit : 100000000, // 100000000 satoshis (1 RDD)
		vowels : ["a","e","i","o","u"],
		non_alpha : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"],
		vowel_names : ["a","ab","abb","abbb","abbbb","abbbbb","abbbbbb","abbbbbbb","abbbbbbbb","abbbbbbbbb","abbbbbbbbbb","abbbbbbbbbbb","abbbbbbbbbbbb","abbbbbbbbbbbbb","abbbbbbbbbbbbbb","abbbbbbbbbbbbbbb"],
		non_vowel_names : ["b","bb","bbb","bbbb","bbbbb","bbbbbb","bbbbbbb","bbbbbbbb","bbbbbbbbb","bbbbbbbbbb","bbbbbbbbbbb","bbbbbbbbbbbb","bbbbbbbbbbbbb","bbbbbbbbbbbbbb","bbbbbbbbbbbbbbb","bbbbbbbbbbbbbbbb"],
		namespace_name: "default",
		namespace : {
			default: {"base":4,"coeff":250,"no_vowel_discount":10,"no_alpha_discount":10,"bucket":[8,7,6,5,4,3,2,2,2,2,2,2,2,2,2,1]},
			reddid: {"base":2,"coeff":2,"no_vowel_discount":2,"no_alpha_discount":2,"bucket":[15, 14, 13, 12, 11, 10, 10, 9, 9, 9, 8, 8, 8, 8, 8, 7]}
		},
		price : {"satoshi": 0.00000085, "fiat": 8500.00}

	},
	pub = {};

	//private
	priv.sum = function (name, array) {
		let sum = 0;
		name = name.toLowerCase();
		for (v in array) {
			if (name.indexOf(array[v]) >= 0 ) {
				sum += 1
			}
			//console.log("Sum Vowels: " + sum)
		}
		return sum;
	};

	priv.calc_name = function (name, namespace_name) {

		let bucket_exponent = 0;
		let discount = 1.0;
		let result = {};
		let namespace = priv.namespace[namespace_name];

		if (name.length <= namespace.bucket.length) {
			bucket_exponent = namespace.bucket[name.length -1];
			result.length = "Using length multiplier " + bucket_exponent + ", ";
		} else {
			bucket_exponent = 0;
			result.length = "No length multiplier used. ";
		}

		if (priv.sum(name, priv.vowels) === 0 ) {
			discount = Math.max (discount, namespace.no_vowel_discount );
			result.no_vowel = "No vowels used, discount applied. ";
		} else {
			result.no_vowel = "Vowels are used, so no discount applied. ";
		}

		if (priv.sum(name, priv.non_alpha) > 0 ) {
			discount = Math.max (discount, namespace.no_alpha_discount );
			result.non_alpha = "Non alpha chars used, discount applied. ";
		} else {
			result.non_alpha = "Alpha chars only used, so no discount applied. ";
		}

		let price = (namespace.coeff * (namespace.base ** bucket_exponent)) / discount * priv.nameCostUnit;
		if (price < priv.nameCostUnit) {
			price = priv.nameCostUnit
		}

		result.price = price;

		return result;
	};
	priv.calc_fiat = function(price) {
		let fiat = priv.price.fiat;
		let sat = priv.price.satoshi;
		let base = fiat * sat;
		let cost = base * price;

		return cost.toFixed(2)


	};
	priv.calcTable = function() {
		let table_head = '<tr><th colspan="3">Names with Vowels</th></tr> <tr><th>Name</th><th>RDD Value</th><th>$$$</th></tr>';
		let table_body = '';
		for (name in priv.vowel_names) {
			let result = priv.calc_name(priv.vowel_names[name], priv.namespace_name);
			let price = priv.calc_fiat(priv.formatPrice(result.price));
			table_body += '<tr><td class="name">' + priv.vowel_names[name] + '</td><td>' + priv.formatPrice(result.price) + '</td><td>' + price + '</td></tr>'
		}
		document.getElementById("nametable1").innerHTML = table_head + table_body;

		table_head = '<tr><th colspan="3">Names without Vowels</th></tr><tr><th>Name</th><th>RDD Value</th><th>$$$</th></tr>';
		table_body = '';
		for (name in priv.non_vowel_names) {
			let result = priv.calc_name(priv.non_vowel_names[name], priv.namespace_name);
			let price = priv.calc_fiat(priv.formatPrice(result.price));
			table_body += '<tr><td class="name">' + priv.non_vowel_names[name] + '</td><td>' + priv.formatPrice(result.price) + '</td><td>' + price + '</td></tr>'
		}
		document.getElementById("nametable2").innerHTML = table_head + table_body;
	};

	priv.getNamespace = function() {
		let namespace = {};
		let price = {};
		namespace.base = document.getElementById("base").value;
		namespace.coeff = document.getElementById("coeff").value;
		namespace.no_vowel_discount = document.getElementById("no_vowel").value;
		namespace.no_alpha_discount = document.getElementById("no_alpha").value;
		namespace.bucket = [];

		for (let i = 0; i < 16; i++){
			namespace.bucket[i] = document.getElementById("b" + i).value;
		}

		price.satoshi = document.getElementById("satoshi").value;
		price.fiat = document.getElementById("btc_usd").value;
		priv.price = price;

		console.log ("Namespace " + JSON.stringify(namespace));
	};

	priv.setNamespace = function() {
		let namespace = {};
		let price = {};
		namespace.base = document.getElementById("base").value;
		namespace.coeff = document.getElementById("coeff").value;
		namespace.no_vowel_discount = document.getElementById("no_vowel").value;
		namespace.no_alpha_discount = document.getElementById("no_alpha").value;
		namespace.bucket = [];

		for (let i = 0; i < 16; i++){
			namespace.bucket[i] = document.getElementById("b" + i).value;
		}

		price.satoshi = document.getElementById("satoshi").value;
		price.fiat = document.getElementById("btc_usd").value;
		priv.price = price;

		console.log ("Namespace " + JSON.stringify(namespace));
		priv.namespace["scratch"] = namespace;
		priv.namespace_name = "scratch";
	};

	priv.formatPrice = function(satoshis) {
		let cost = satoshis * COIN;
		cost = cost.toFixed(8);
		return cost
	};

	//public
	
	pub.initListeners = function(){
		document.getElementById("calc").onkeyup = function(e) {
			let name = e.target.id;
			console.log ("value changes: " + name );
			priv.getNamespace();
			priv.calcTable(priv.namespace_name);
			pub.nameprice();
		};

		document.getElementById("params").onkeyup = function(v) {
			console.log (`Value for ${v.target.id} modified`);
			priv.setNamespace();
			priv.calcTable(priv.namespace_name);
			pub.nameprice();
		}
	};

	pub.nameprice = function () {
		let name = document.getElementById("name").value;
		let namespace = priv.namespace_name;
		let result = priv.calc_name(name, namespace);
		let cost = priv.formatPrice(result.price);
		let fiat = priv.calc_fiat(priv.formatPrice(result.price));
		document.getElementById("result").innerHTML = `Using the ${priv.namespace_name} namespace calculations.<br>${name} is ${name.length} characters long.<br>${result.length}<br>${result.no_vowel}<br>${result.non_alpha} `;
		document.getElementById("result_cost").innerHTML = `<br>The price of ${name} is ${cost} RDD or approx ${fiat} USD.`
	};

	pub.load = function (namespace_name) {

		let namespace = priv.namespace[namespace_name];

		document.getElementById("base").value = namespace.base;
		document.getElementById("coeff").value = namespace.coeff;
		document.getElementById("no_vowel").value = namespace.no_vowel_discount;
		document.getElementById("no_alpha").value = namespace.no_alpha_discount;
		
		for (let i = 0; i < 16; i++){
			document.getElementById("b" + i).value = namespace.bucket[i];
		}

		document.getElementById("satoshi").value = priv.price.satoshi.toFixed(8);
		document.getElementById("btc_usd").value = priv.price.fiat;
		//private.getNamespace();
		priv.calcTable(namespace_name);
	};

	pub.load(priv.namespace_name);
	pub.initListeners();

	// Publish module
	exports.price = pub;
})(exports);

