var exports = {};
costing = exports;

COIN = 0.00000001;

(function (exports) {
	var private = {
		nameCostUnit : 100000000, // 100000000 satoshis (1 RDD)
		vowels : ["a","e","i","o","u"],
		non_alpha : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"],
		vowel_names : ["a","ab","abb","abbb","abbbb","abbbbb","abbbbbb","abbbbbbb","abbbbbbbb","abbbbbbbbb","abbbbbbbbbb","abbbbbbbbbbb","abbbbbbbbbbbb","abbbbbbbbbbbbb","abbbbbbbbbbbbbb","abbbbbbbbbbbbbbb"],
		non_vowel_names : ["b","bb","bbb","bbbb","bbbbb","bbbbbb","bbbbbbb","bbbbbbbb","bbbbbbbbb","bbbbbbbbbb","bbbbbbbbbbb","bbbbbbbbbbbb","bbbbbbbbbbbbb","bbbbbbbbbbbbbb","bbbbbbbbbbbbbbb","bbbbbbbbbbbbbbbb"],
		namespace : {"base":4,"coeff":250,"no_vowel_discount":10,"no_alpha_discount":10,"bucket":[8,7,6,5,4,3,2,2,2,2,2,2,2,2,2,1]},
		price : {"satoshi": 0.00000085, "fiat": 8500.00}

	},
	public = {};

	//private
	private.sum = function (name, array) {
		sum = 0;
		name = name.toLowerCase();
		for (v in array) {
			if (name.indexOf(array[v]) >= 0 ) {
				sum += 1
			}
			//console.log("Sum Vowels: " + sum)
		}
		return sum;
	}

	private.calc_name = function (name, namespace) {

		bucket_exponent = 0;
		discount = 1.0;
		result = {};

		if (name.length <= namespace.bucket.length) {
			bucket_exponent = namespace.bucket[name.length -1]
			result.length = "Using length modifier " + bucket_exponent + ", ";
		} else {
			bucket_exponent = 0
			result.length = "No length modifier used. ";
		}

		if (private.sum(name, private.vowels) == 0 ) {
			discount = Math.max (discount, namespace.no_vowel_discount );
			result.no_vowel = "No vowels used, discount applied. ";
		} else {
			result.no_vowel = "Vowels are used, so no discount applied. ";
		}

		if (private.sum(name, private.non_alpha) > 0 ) {
			discount = Math.max (discount, namespace.no_alpha_discount )
			result.non_alpha = "Non alpha chars used, discount applied. ";
		} else {
			result.non_alpha = "Alpha chars only used, so no discount applied. ";
		}

		price = (namespace.coeff * (namespace.base ** bucket_exponent)) / discount * private.nameCostUnit
		if (price < private.nameCostUnit) {
			price = private.nameCostUnit
		}

		result.price = price;

		return result;
	}
	private.calc_fiat = function(price) {
		var fiat = private.price.fiat;
		var sat = private.price.satoshi;
		var base = fiat * sat;
		var cost = base * price;

		return cost.toFixed(2)


	}
	private.calcTable = function() {
		var table_head = '<tr><th colspan="3">Names with Vowels</th></tr> <tr><th>Name</th><th>RDD Value</th><th>$$$</th></tr>'
		var table_body = ''
		for (name in private.vowel_names) {
			var result = private.calc_name(private.vowel_names[name], private.namespace)
			var price = private.calc_fiat(private.formatPrice(result.price))
			table_body += '<tr><td class="name">' + private.vowel_names[name] + '</td><td>' + private.formatPrice(result.price) + '</td><td>' + price + '</td></tr>'
		}
		document.getElementById("nametable1").innerHTML = table_head + table_body;

		table_head = '<tr><th colspan="3">Names without Vowels</th></tr><tr><th>Name</th><th>RDD Value</th><th>$$$</th></tr>'
		table_body = ''
		for (name in private.non_vowel_names) {
			var result = private.calc_name(private.non_vowel_names[name], private.namespace)
			var price = private.calc_fiat(private.formatPrice(result.price))
			table_body += '<tr><td class="name">' + private.non_vowel_names[name] + '</td><td>' + private.formatPrice(result.price) + '</td><td>' + price + '</td></tr>'
		}
		document.getElementById("nametable2").innerHTML = table_head + table_body;
	}

	private.getNamespace = function() {
		namespace = {};
		price = {};
		namespace.base = document.getElementById("base").value;
		namespace.coeff = document.getElementById("coeff").value;
		namespace.no_vowel_discount = document.getElementById("no_vowel").value;
		namespace.no_alpha_discount = document.getElementById("no_alpha").value;
		namespace.bucket = [];

		for (i = 0; i < 16; i++){
			namespace.bucket[i] = document.getElementById("b" + i).value;
		}

		price.satoshi = document.getElementById("satoshi").value;
		price.fiat = document.getElementById("btc_usd").value;
		private.price = price;

		console.log ("Namespace " + JSON.stringify(namespace))
		private.namespace = namespace;
	}
	private.formatPrice = function(satoshis) {
		cost = satoshis * COIN
		cost = cost.toFixed(8);
		return cost
	}

	public.initListeners = function(){
		document.getElementById("calc").onkeyup = function(e) {
			var name = e.target.id;
			console.log ("value changes: " + name )
			private.getNamespace();
			private.calcTable();
			public.nameprice();
		}
	}

	//public

	public.nameprice = function () {
		name = document.getElementById("name").value;
		result = private.calc_name(name, private.namespace)
		cost = private.formatPrice(result.price);
		fiat = private.calc_fiat(private.formatPrice(result.price))
		document.getElementById("result").innerHTML = "Price of " + name + " is " + cost + " RDD or $" + fiat + ".<br>" + name + " is " + name.length + " chars.<br>" + result.length + result.no_vowel + result.non_alpha;
	}

	public.load = function () {
		document.getElementById("base").value = private.namespace.base;
		document.getElementById("coeff").value = private.namespace.coeff;
		document.getElementById("no_vowel").value = private.namespace.no_vowel_discount;
		document.getElementById("no_alpha").value = private.namespace.no_alpha_discount;
		
		for (i = 0; i < 16; i++){
			document.getElementById("b" + i).value = private.namespace.bucket[i];
		}

		document.getElementById("satoshi").value = private.price.satoshi.toFixed(8);
		document.getElementById("btc_usd").value = private.price.fiat;
		//private.getNamespace();
		private.calcTable();
	}
	public.load();
	public.initListeners();

	// Publish module
	exports.price = public;
})(exports);

