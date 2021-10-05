/*
TODO:
	Comment stuff

	the more you upgrade a button the better it looks
		maybe remove css styles in the beginning and slowly add them (0px boarder radius next upgrade 1px)

	if game to easy only do damage / 1.x (instead of redoing the formula)

	jank code:
		money effect by getting the mouse position and setting the position to fixed or something
		default border radius for the random weak spot doesnt work so i did a lazy fix
*/

// custom typescript types
type elementByID = HTMLElement | null;

document.addEventListener("DOMContentLoaded", () => {
	setTimeout(() => {
		// remove ads
		let non_ads = document.querySelectorAll(".non-ads");

		document.body.innerHTML = "";
		non_ads?.forEach((e) => {
			document.body.innerHTML += e.outerHTML;
		});

		// detect whether the user is using a touch screen or not
		let user_interaction: string = "click";
		let user_interaction_start = "mousedown";
		let user_interaction_end = "mouseup";
		// @ts-ignore
		if ("ontouchstart" in window || navigator.msMaxTouchPoints > 0) {
			user_interaction = "touchstart";
			user_interaction_start = "touchstart";
			user_interaction_end = "touchend";
		}

		// start screen
		let start_button = document.getElementById("start-button");
		let start_screen_container = document.getElementById("start-screen-container");

		// getting elements from html
		let field = document.getElementById("field");
		let darken_background = document.getElementById("darken-background");

		let enemy = document.getElementById("enemy");
		let left_eye = document.getElementById("left-eye");
		let right_eye = document.getElementById("right-eye");

		let money_counter = document.getElementById("money-counter");
		// let prestige_money_counter = document.getElementById("prestige-money-counter");
		let enemy_health = document.getElementById("enemy-health");
		let round_counter = document.getElementById("round-counter");

		let attack_upgrade = document.getElementById("attack-upgrade");
		let crit_chance_upgrade = document.getElementById("crit-chance-upgrade");
		let crit_multi_upgrade = document.getElementById("crit-multi-upgrade");
		let money_multi_upgrade = document.getElementById("money-multi-upgrade");

		let attack_stat = document.getElementById("attack-stat");
		let crit_chance_stat = document.getElementById("crit-chance-stat");
		let crit_multi_stat = document.getElementById("crit-multi-stat");
		let money_multi_stat = document.getElementById("money-multi-stat");

		let prestige_button = document.getElementById("prestige-button");

		let prestige_timer = document.getElementById("prestige-timer");

		let body_part = document.querySelectorAll(".body-part");
		let money_effect = document.getElementById("money-effect");
		let prestige_money_effect = document.getElementById("prestige-money-effect");

		let prestige_shop = document.getElementById("prestige-shop");
		let prestige_shop_button = document.getElementById("prestige-shop-button");
		let close_prestige_shop = document.getElementById("close-prestige-shop");
		let prestige_money_counter = document.getElementById("prestige-money-counter");

		let super_prestige_shop = document.getElementById("super-prestige-shop");
		let super_prestige_shop_button = document.getElementById("super-prestige-shop-button");
		let close_super_prestige_shop = document.getElementById("close-super-prestige-shop");
		let super_prestige_money_counter = document.getElementById("super-prestige-money-counter");

		let prestige_attack_upgrade = document.getElementById("prestige-attack-upgrade");
		let prestige_crit_chance_upgrade = document.getElementById("prestige-crit-chance-upgrade");
		let prestige_crit_multi_upgrade = document.getElementById("prestige-crit-multi-upgrade");
		let prestige_money_multi_upgrade = document.getElementById("prestige-money-multi-upgrade");

		let max_money_upgrade = document.getElementById("max-money-upgrade");
		let less_random_money_upgrade = document.getElementById("less-random-money-upgrade");
		let add_round_damage_upgrade = document.getElementById("round-attack-upgrade");
		let stronger_rythm_upgrade = document.getElementById("rythm-upgrade");

		let rythm_display_text = document.getElementById("rythm-display-text");
		let rythm_display_bar = document.getElementById("rythm-display-bar");
		let rythm_display_cover = document.getElementById("rythm-display-cover");

		let frenzy_slider = document.getElementById("frenzy-slider");
		let frenzy_progress_bar = document.getElementById("frenzy-progress-bar");

		let league_slider = document.getElementById("league-slider");
		let league_progress_bar = document.getElementById("league-progress-bar");

		let weak_spot = document.getElementById("weak-spot");
		let inverted_enemy_color = document.querySelectorAll(".inverted-enemy-color");

		// basic values
		let round = 1;

		let dead = false;

		let max_hp = 10;
		let hp = 10;

		let money = 0;

		let time = 0;
		let total_time = 0;

		let prestige1_info = {
			name: "Prestige",
			currency: "¢",
			lvl: 1,

			money_counter_element: prestige_money_counter,
			shop_element: prestige_shop,
			open_shop_element: prestige_shop_button,
			close_shop_element: close_prestige_shop,

			num: 0,
			money: 0,

			round: 25,
			available: false,

			time: 0,

			interval: 0,

			color: "rgb(219, 122, 105)",
		};
		let prestige2_info = {
			name: "Super Prestige",
			currency: "₴",
			lvl: 2,

			money_counter_element: super_prestige_money_counter,
			shop_element: super_prestige_shop,
			open_shop_element: super_prestige_shop_button,
			close_shop_element: close_super_prestige_shop,

			num: 0,
			money: 0,

			round: 30,
			available: false,

			time: 0,

			interval: 0,

			color: "rgb(105, 168, 219)",
		};
		let prestige3_info = {
			name: "Final Prestige",
			currency: "₴",
			lvl: 3,

			money_counter_element: null,
			shop_element: null,
			open_shop_element: null,
			close_shop_element: null,

			num: 0,
			money: 0,

			round: 35,
			available: false,

			time: 0,

			interval: 0,

			color: "rgb(122, 219, 105)",
		};

		let prestige_lvl = 0;

		let temp_rgb: string;
		let temp_rgb2: string;

		// used for upgrades
		let Upgrade = class {
			obj: {
				name: string;
				element: elementByID;

				lvl: number;
				max_lvl: number;

				cost_multi: number;

				stat_element: elementByID;
				stat: number;

				increaseStats: CallableFunction;

				prestigeLvl: number;
			};
			listener: null | VoidFunction;

			constructor(obj: {
				name: string;
				element: elementByID;
				lvl: number;
				max_lvl: number;
				cost_multi: number;
				stat_element: elementByID;
				stat: number;
				increaseStats: CallableFunction;
				prestigeLvl: number;
			}) {
				this.obj = obj;
				this.updateDisplay();
				this.listener = null;
			}

			callculateCost() {
				if (this.obj.prestigeLvl !== 2 && this.obj.cost_multi >= 0) {
					return Math.round(((10 * this.obj.lvl + 10) ** 1.1) ** this.obj.cost_multi);
				} else {
					return Math.round((this.obj.lvl + 1) * 10 * this.obj.cost_multi);
				}
			}

			updateDisplay() {
				temp_cost = this.callculateCost();

				// changes inner html value to show cost
				this.obj.element!.innerHTML = this.obj.name + "<br>lvl " + this.obj.lvl + "<br>cost: " + temp_cost + "$";

				//updates stat info
				if (this.obj.stat_element) {
					this.obj.stat_element!.innerHTML = this.obj.name + " = " + this.obj.stat;
				}

				updateMoneyCounter();
				if (prestige1) {
					prestige1.updateMoneyCounter();
				}
				if (prestige2) {
					prestige2.updateMoneyCounter();
				}
			}

			addLvl() {
				this.obj.lvl += 1;

				this.updateDisplay();

				// calculates stat increase
				this.obj.increaseStats();
			}

			onClick() {
				if (this.obj.lvl >= this.obj.max_lvl && this.obj.max_lvl !== -1) {
					this.obj.element!.innerHTML = this.obj.name + "<br>lvl " + this.obj.lvl + "<br>MAX LEVEL";
				} else {
					temp_cost = this.callculateCost();

					switch (this.obj.prestigeLvl) {
						case 0:
							if (money >= temp_cost) {
								// subtracts cost and updates lvl
								money -= temp_cost;

								this.addLvl();
							}
							break;
						case 1:
							if (prestige1_info.money >= temp_cost) {
								// subtracts cost and updates lvl
								prestige1_info.money -= temp_cost;

								this.addLvl();
							}
							break;
						case 2:
							if (prestige2_info.money >= temp_cost) {
								// subtracts cost and updates lvl
								prestige2_info.money -= temp_cost;

								this.addLvl();
							}
							break;
					}
					if (this.obj.lvl >= this.obj.max_lvl && this.obj.max_lvl !== -1) {
						this.obj.element!.innerHTML = this.obj.name + "<br>lvl " + this.obj.lvl + "<br>MAX LEVEL";
					}
				}
			}

			listenForClick() {
				this.obj.element?.addEventListener(user_interaction, (this.listener = this.onClick.bind(this)));
			}
		};

		let temp_cost: number;

		function increase_attack() {
			return Math.round((attack_info.stat * 1.4) ** 0.97 + 1) + round * add_round_damage_info.stat;
		}

		let attack_info = {
			name: "Attack",
			element: attack_upgrade,

			lvl: 1,
			max_lvl: 100,

			cost_multi: 1.15,

			stat_element: attack_stat,
			stat: 1,

			increaseStats: () => {
				attack_info.stat = increase_attack();
				//updates stat info
				attack_info.stat_element!.innerHTML = attack_info.name + " = " + attack_info.stat;
				crit_multi_info.stat_element!.innerHTML =
					"Crit Multiplier" + " = " + (attack_info.stat ** crit_multi_info.stat / attack_info.stat).toFixed(2) + "x";
			},

			prestigeLvl: 0,
		};
		let crit_chance_info = {
			name: "Crit Chance",

			element: crit_chance_upgrade,

			lvl: 0,
			max_lvl: 60,

			cost_multi: 1.3,

			stat_element: crit_chance_stat,
			stat: 0,

			prestigeLvl: 0,

			increaseStats: () => {
				crit_chance_info.stat += 0.004;

				//updates stat info
				crit_chance_info.stat_element!.innerHTML =
					crit_chance_info.name + " = " + (crit_chance_info.stat * 100).toFixed(2) + "%";
			},
		};
		let crit_multi_info = {
			name: "Crit Multiplier",

			element: crit_multi_upgrade,

			lvl: 1,
			max_lvl: 30,

			cost_multi: 1.4,

			stat_element: crit_multi_stat,
			stat: 1.2,

			increaseStats: () => {
				crit_multi_info.stat += 0.01;

				//updates stat info
				crit_multi_info.stat_element!.innerHTML =
					crit_multi_info.name + " = " + (attack_info.stat ** crit_multi_info.stat / attack_info.stat).toFixed(2) + "x";
			},

			prestigeLvl: 0,
		};
		let money_multi_info = {
			name: "Money Multiplier",

			element: money_multi_upgrade,

			lvl: 1,
			max_lvl: 65,

			cost_multi: 1.5,

			stat_element: money_multi_stat,
			stat: 1,

			increaseStats: () => {
				money_multi_info.stat += 0.1;

				//updates stat info
				money_multi_info.stat_element!.innerHTML =
					money_multi_info.name + " = " + money_multi_info.stat.toFixed(2) + "x";
			},

			prestigeLvl: 0,
		};

		let attack = new Upgrade(attack_info);
		let crit_chance = new Upgrade(crit_chance_info);
		let crit_multi = new Upgrade(crit_multi_info);
		let money_multi = new Upgrade(money_multi_info);

		let attack_prestige_info = {
			name: "Attack",

			element: prestige_attack_upgrade,

			lvl: 0,
			max_lvl: 100,

			cost_multi: 1.15,

			stat_element: attack_stat,
			stat: 1,

			increaseStats: () => {
				attack_info.stat = Math.round(increase_attack() * 1.05);
				//updates stat info
				attack_info.stat_element!.innerHTML = attack_info.name + " = " + attack_info.stat;
				crit_multi_info.stat_element!.innerHTML =
					"Crit Multiplier" + " = " + (attack_info.stat ** crit_multi_info.stat / attack_info.stat).toFixed(2) + "x";
			},

			prestigeLvl: 1,
		};
		let crit_chance_prestige_info = {
			name: "Crit Chance",

			element: prestige_crit_chance_upgrade,

			lvl: 0,
			max_lvl: 60,

			cost_multi: 1.3,

			stat_element: crit_chance_stat,
			stat: 0,

			increaseStats: () => {
				crit_chance_info.stat += 0.0045;

				//updates stat info
				crit_chance_info.stat_element!.innerHTML =
					crit_chance_info.name + " = " + (crit_chance_info.stat * 100).toFixed(2) + "%";
			},

			prestigeLvl: 1,
		};
		let crit_multi_prestige_info = {
			name: "Crit Multiplier",

			element: prestige_crit_multi_upgrade,

			lvl: 0,
			max_lvl: 30,

			cost_multi: 1.4,

			stat_element: crit_multi_stat,
			stat: 1.2,

			increaseStats: () => {
				crit_multi_info.stat += 0.0105;

				//updates stat info
				crit_multi_info.stat_element!.innerHTML =
					crit_multi_info.name + " = " + (attack_info.stat ** crit_multi_info.stat / attack_info.stat).toFixed(2) + "x";
			},

			prestigeLvl: 1,
		};
		let money_multi_prestige_info = {
			name: "Money Multiplier",

			element: prestige_money_multi_upgrade,

			lvl: 0,
			max_lvl: 65,

			cost_multi: 1.5,

			stat_element: money_multi_stat,
			stat: 1,

			increaseStats: () => {
				money_multi_info.stat += 0.11;

				//updates stat info
				money_multi_info.stat_element!.innerHTML =
					money_multi_info.name + " = " + money_multi_info.stat.toFixed(2) + "x";
			},

			prestigeLvl: 1,
		};

		let attack_prestige = new Upgrade(attack_prestige_info);
		let crit_chance_prestige = new Upgrade(crit_chance_prestige_info);
		let crit_multi_prestige = new Upgrade(crit_multi_prestige_info);
		let money_multi_prestige = new Upgrade(money_multi_prestige_info);

		let add_round_damage_info = {
			name: "Add Round To Damage",

			element: add_round_damage_upgrade,

			lvl: 0,
			max_lvl: 5,

			cost_multi: 1,

			stat_element: null,
			stat: 0,

			increaseStats: () => {
				add_round_damage_info.stat += 2;
			},

			prestigeLvl: 2,
		};
		let stronger_rythm_info = {
			name: "Stronger Rythm",

			element: stronger_rythm_upgrade,

			lvl: 0,
			max_lvl: 5,

			cost_multi: 1.3,

			stat_element: null,
			stat: 0.5,

			increaseStats: () => {
				stronger_rythm_info.stat += 1;
			},

			prestigeLvl: 2,
		};
		let max_money_info = {
			name: "Bigger Max Roll",

			element: max_money_upgrade,

			lvl: 0,
			max_lvl: 5,

			cost_multi: 2,

			stat_element: null,
			stat: 4,

			increaseStats: () => {
				max_money_info.stat += 1;
			},

			prestigeLvl: 2,
		};
		let less_random_money_info = {
			name: "Less Random Money",

			element: less_random_money_upgrade,

			lvl: 0,
			max_lvl: 5,

			cost_multi: 1.5,

			stat_element: null,
			stat: 1,

			increaseStats: () => {
				less_random_money_info.stat += 1;
				max_money_info.stat -= 1;
			},

			prestigeLvl: 2,
		};

		let add_round_damage = new Upgrade(add_round_damage_info);
		let stronger_rythm = new Upgrade(stronger_rythm_info);
		let max_money = new Upgrade(max_money_info);
		let less_random_money = new Upgrade(less_random_money_info);

		add_round_damage.listenForClick();
		stronger_rythm.listenForClick();
		max_money.listenForClick();
		less_random_money.listenForClick();

		let upgrade_list = {
			attack: attack,
			crit_chance: crit_chance,
			crit_multi: crit_multi,
			money_multi: money_multi,

			attack_prestige: attack_prestige,
			crit_chance_prestige: crit_chance_prestige,
			crit_multi_prestige: crit_multi_prestige,
			money_multi_prestige: money_multi_prestige,

			add_round_damage: add_round_damage,
			stronger_rythm: stronger_rythm,
			max_money: max_money,
			less_random_money: less_random_money,
		};

		// resets stats and values to default after prestige
		function defaultStats() {
			round = 1;

			money = 0;

			temp_cost;

			attack_info.stat = 1;
			attack_info.lvl = 1;

			crit_chance_info.stat = 0;
			crit_chance_info.lvl = 0;

			crit_multi_info.stat = 1.2;
			crit_multi_info.lvl = 1;

			money_multi_info.stat = 1;
			money_multi_info.lvl = 1;

			rythm_bar_deg = 0;
			rythm_damage_multi = 1;

			in_frenzy_mode = false;
			current_frenzy_time = frenzy_time;
		}

		let enemy_color = [0, 0, 128];
		let enemy_eye_color = [255, 255, 0];

		let temp_color_easter_egg = "";
		let temp_background_color = "";

		// temp (timer) array varible
		let temp_array = [];

		// rythm variables
		let date = new Date();
		let current_click_time = 0;
		let last_click_time = date.getTime();
		let click_differences = [0, 0, 0];
		let click_differences_time_difference = click_differences;
		let time_difference = 0;
		let rythm_bar_deg = 0;
		let rythm_damage_multi = 1;

		// slider variables
		let in_frenzy_mode = false;
		const frenzy_time = 120;
		let current_frenzy_time = frenzy_time;
		let frenzy_count_down: number;

		// league variables
		let league_click_count = 0;
		let league_lvl = 0;
		let league_requirement = Math.round(((league_lvl + 1) * 100) ** (1 + league_lvl / 100));

		// weak spot variables
		let weak_spot_location = [0, 0];
		let clicked_weak_spot = false;
		let enemy_boarder_radius = 25;

		document.addEventListener("contextmenu", (event) => event.preventDefault());

		// resets stats and values to default after prestige
		function defaultPrestigeUpgradeStats() {
			attack_prestige_info.lvl = 0;
			crit_chance_prestige_info.lvl = 0;
			crit_multi_prestige_info.lvl = 0;
			money_multi_prestige_info.lvl = 0;

			prestige1_info.money = 0;

			league_lvl = 0;
			league_click_count = 0;
		}

		let deleted_save = false;

		function save() {
			window.localStorage.setItem("prestige 1 num", prestige1_info.num + "");
			window.localStorage.setItem("prestige 1 money", prestige1_info.money + "");

			window.localStorage.setItem("prestige attack lvl", attack_prestige_info.lvl + "");
			window.localStorage.setItem("prestige crit chance lvl", crit_chance_prestige_info.lvl + "");
			window.localStorage.setItem("prestige crit multi lvl", crit_multi_prestige_info.lvl + "");
			window.localStorage.setItem("prestige money multi lvl", money_multi_prestige_info.lvl + "");

			window.localStorage.setItem("prestige 2 num", prestige2_info.num + "");
			window.localStorage.setItem("prestige 2 money", prestige2_info.money + "");

			window.localStorage.setItem("add round damage lvl", add_round_damage_info.lvl + "");
			window.localStorage.setItem("stronger rythm lvl", stronger_rythm_info.lvl + "");
			window.localStorage.setItem("less random money lvl", less_random_money_info.lvl + "");
			window.localStorage.setItem("max money multi lvl", max_money_info.lvl + "");

			window.localStorage.setItem("league lvl", league_lvl + "");

			gameTime();
			if (total_time) {
				window.localStorage.setItem("total time", "" + total_time);
			} else {
				window.alert("ERROR: problem with saving total game time");
			}
		}
		function load() {
			let load_values = {
				0: window.localStorage.getItem("prestige 1 num"),
				1: window.localStorage.getItem("prestige 1 money"),
				2: window.localStorage.getItem("prestige attack lvl"),
				3: window.localStorage.getItem("prestige crit chance lvl"),
				4: window.localStorage.getItem("prestige crit multi lvl"),
				5: window.localStorage.getItem("prestige money multi lvl"),
				6: window.localStorage.getItem("prestige 2 num"),
				7: window.localStorage.getItem("prestige 2 money"),
				8: window.localStorage.getItem("add round damage lvl"),
				9: window.localStorage.getItem("stronger rythm lvl"),
				10: window.localStorage.getItem("less random money lvl"),
				11: window.localStorage.getItem("max money multi lvl"),
				12: window.localStorage.getItem("league lvl"),
				13: window.localStorage.getItem("total time"),
			};

			if (load_values[0] !== null && load_values[0] !== "" && load_values[1] !== null && load_values[1] !== "") {
				prestige1_info.num = parseInt(load_values[0]);
				prestige1_info.money = parseInt(load_values[1]);
			}

			if (
				load_values[2] !== null &&
				load_values[2] !== "" &&
				load_values[3] !== null &&
				load_values[3] !== "" &&
				load_values[4] !== null &&
				load_values[4] !== "" &&
				load_values[5] !== null &&
				load_values[5] !== ""
			) {
				attack_prestige_info.lvl = parseInt(load_values[2]);
				crit_chance_prestige_info.lvl = parseInt(load_values[3]);
				crit_multi_prestige_info.lvl = parseInt(load_values[4]);
				money_multi_prestige_info.lvl = parseInt(load_values[5]);
			}

			if (load_values[6] !== null && load_values[6] !== "" && load_values[7] !== null && load_values[7] !== "") {
				prestige2_info.num = parseInt(load_values[6]);
				prestige2_info.money = parseInt(load_values[7]);
			}

			if (
				load_values[8] !== null &&
				load_values[8] !== "" &&
				load_values[9] !== null &&
				load_values[9] !== "" &&
				load_values[10] !== null &&
				load_values[10] !== "" &&
				load_values[11] !== null &&
				load_values[11] !== ""
			) {
				add_round_damage_info.lvl = parseInt(load_values[8]);
				stronger_rythm_info.lvl = parseInt(load_values[9]);
				less_random_money_info.lvl = parseInt(load_values[10]);
				max_money_info.lvl = parseInt(load_values[11]);
			}

			if (load_values[12] !== null && load_values[12] !== "") {
				league_lvl = parseInt(load_values[12]);
			}

			if (load_values[13] !== null && load_values[13] !== "") {
				total_time = parseInt(load_values[13]);
			}

			if (prestige1_info.num > 0) {
				prestige1_info.open_shop_element?.classList.remove("invisible");
				prestige1.openShop();
				prestige1.closeShop();
			}
			if (prestige2_info.num > 0) {
				prestige2_info.open_shop_element?.classList.remove("invisible");
				prestige2.openShop();
				prestige2.closeShop();
			}

			if (prestige1_info.num > 1) {
				crit_multi.listenForClick();
				crit_multi_upgrade?.classList.remove("locked");
				crit_multi_upgrade?.classList.add("clickable");

				money_multi_upgrade?.classList.remove("invisible");

				attack_prestige.listenForClick();
				crit_chance_prestige.listenForClick();
			}
			if (prestige1_info.num > 2) {
				money_multi.listenForClick();
				money_multi_upgrade?.classList.remove("locked");
				money_multi_upgrade?.classList.add("clickable");

				money_multi_stat?.classList.remove("invisible");

				crit_multi_prestige.listenForClick();
				prestige_crit_multi_upgrade?.classList.remove("locked");
				prestige_crit_multi_upgrade?.classList.add("clickable");

				prestige_money_multi_upgrade?.classList.remove("invisible");
			}
			if (prestige1_info.num > 3) {
				money_multi_prestige.listenForClick();
				prestige_money_multi_upgrade?.classList.remove("locked");
				prestige_money_multi_upgrade?.classList.add("clickable");
			}
			unlockUpgrades();

			prestige1.updateMoneyCounter();
			prestige2.updateMoneyCounter();

			updateUpgradeDisplay();

			upgradesSuperPrestigeAfterLoad();
			upgradesPrestigeAfterReset();
		}
		function deleteSave() {
			window.localStorage.setItem("prestige 1 num", "");
			window.localStorage.setItem("prestige 1 money", "");

			window.localStorage.setItem("prestige attack lvl", "");
			window.localStorage.setItem("prestige crit chance lvl", "");
			window.localStorage.setItem("prestige crit multi lvl", "");
			window.localStorage.setItem("prestige money multi lvl", "");

			window.localStorage.setItem("prestige 2 num", "");
			window.localStorage.setItem("prestige 2 money", "");

			window.localStorage.setItem("add round damage lvl", "");
			window.localStorage.setItem("stronger rythm lvl", "");
			window.localStorage.setItem("less random money lvl", "");
			window.localStorage.setItem("max money multi lvl", "");

			window.localStorage.setItem("league lvl", "");
			window.localStorage.setItem("total time", "");
		}

		// removes/adds start menu and starts: background music and frenzy timer
		class Start {
			static listener: null | VoidFunction;

			static removeStartScreen(callAfter: object | null = null) {
				start_screen_container?.classList.add("invisible");

				if (typeof callAfter === "object") {
					for (let func in callAfter) {
						// @ts-ignore
						if (typeof callAfter[func] === "function") {
							// @ts-ignore
							callAfter[func]();
						}
					}
				}

				if (typeof this.listener === "function") {
					start_button?.removeEventListener(user_interaction, this.listener);
				}
			}
			static addStartScreen(callBefore: object | null = null, callAfter: object | null = null) {
				start_screen_container!.style.backgroundColor =
					document.documentElement.style.getPropertyValue("--body_background_color");
				start_screen_container?.classList.remove("invisible");

				if (typeof callBefore === "object") {
					for (let func in callBefore) {
						// @ts-ignore
						if (typeof callBefore[func] === "function") {
							// @ts-ignore
							callBefore[func]();
						}
					}
				}

				this.ListenForClick(this.removeStartScreen, callAfter);
			}

			static music() {
				const background_music: any = document.getElementById("background-music");

				background_music.volume = 0.35;
				background_music.play();
			}

			static ListenForClick(func: VoidFunction | null, callAfter: object | null = null) {
				if (typeof func === "function") {
					start_button?.addEventListener(user_interaction, (this.listener = func.bind(this, callAfter)));
				}
			}
		}
		function gameTime() {
			if (time !== 0) {
				total_time += new Date().getTime() - time;
			}
			time = new Date().getTime();
		}
		gameTime();

		Start.addStartScreen(null, {
			a: frenzy,
			b: Start.music,
			c: gameTime,
		});

		//creates a new enemy
		function newEnemy() {
			max_hp = Math.round((10 * round * 1.05) ** (1 + round / 20) * 1.2);
			hp = max_hp;
			dead = false;

			updateHealth();

			updateRoundCounter();

			randomWeakSpot();
		}
		// changes enemy color and enemy eye color
		function changeEnemyColor() {
			temp_rgb = "rgb(";
			temp_rgb2 = "rgb(";

			for (let x = 0; x < 3; x++) {
				enemy_color[x] += Math.ceil(30 * Math.random() * 10);
				enemy_eye_color[x] += Math.ceil(30 * Math.random() * 10);
				if (enemy_color[x] > 255) {
					enemy_color[x] -= 255;
				}
				if (enemy_eye_color[x] > 255) {
					enemy_eye_color[x] -= 255;
				}
				temp_rgb += enemy_color[x] + ",";
				temp_rgb2 += enemy_eye_color[x] + ",";
			}

			temp_rgb = temp_rgb.slice(0, -1);
			temp_rgb += ")";
			temp_rgb2 = temp_rgb2.slice(0, -1);
			temp_rgb2 += ")";

			console.log("");
			console.log("enemy color: " + temp_rgb + ", enemy eye color: " + temp_rgb2);
			console.log("");

			enemy!.style.backgroundColor = temp_rgb;
			body_part?.forEach((Element) => {
				Element.setAttribute("style", "background-color: " + temp_rgb2 + ";");
			});

			inverted_enemy_color.forEach((element) => {
				element.setAttribute("style", "background: " + enemy?.style.backgroundColor + "; filter: invert(1);");
			});
		}
		newEnemy();
		changeEnemyColor();

		// deals damage and calculates crits
		function dealDamage() {
			if (Math.random() <= crit_chance_info.stat) {
				hp -= Math.round(attack_info.stat ** crit_multi_info.stat * rythm_damage_multi);
				rythm_bar_deg += 5;

				// console.log(
				// 	"dealt " + Math.round(attack_info.stat ** crit_multi_info.stat * rythm_damage_multi) + " damage!!!"
				// );

				if (document.documentElement.style.getPropertyValue("--body_background_color") !== "firebrick") {
					temp_background_color = document.documentElement.style.getPropertyValue("--body_background_color");
				}
				document.documentElement.style.setProperty("--body_background_color", "firebrick");
				setTimeout(() => {
					document.documentElement.style.setProperty("--body_background_color", temp_background_color);
				}, 100);
			} else {
				hp -= Math.round(attack_info.stat * rythm_damage_multi);

				// console.log("dealt " + Math.round(attack_info.stat * rythm_damage_multi) + " damage");
			}
		}
		function calculatemoneyMade(e: MouseEvent) {
			// adds money WIP!!!!
			let roll = Math.round(Math.random() * max_money_info.stat) + less_random_money_info.stat;
			let money_made = Math.round(
				(roll * (round + 1) + 1) ** (1 + (round + 1) ** 1.05 / (round + 1) ** 1.1) * money_multi_info.stat
			);

			// doubles money made if enemy killed
			if (right_eye?.style.height === "0px") {
				money_made *= 2;
			}

			money += money_made;

			// updates money counter
			updateMoneyCounter();

			// tells the user what you "rolled" and how much money you made
			console.log("");
			console.log("You rolled a " + roll);
			console.log("You have made: " + money_made + "$ \nyou have: " + money + "$");
			console.log("");

			// money gained animation
			money_counter!.style.animationDirection = "normal";
			money_counter!.style.animationName = "increaseTextSize";

			// adds money effect that displays how much $$$ you got
			money_effect!.innerHTML = money_made + "$";
			money_effect!.style.marginTop = e.clientY - window.innerHeight / 2 + money_effect!.clientHeight * 3 + "px";
			money_effect!.style.marginLeft = e.clientX - window.innerWidth / 2 - money_effect!.clientWidth + "px";
			money_effect!.style.animationName = "disappearing-effect";

			// money animation
			setTimeout(() => {
				money_counter!.style.animationDirection = "reverse";
			}, 1000);

			// resets money killing animation
			setTimeout(() => {
				money_counter!.style.animationName = "none";
			}, 2000);
		}
		// handles killing the enemy
		function killEnemy() {
			enemy_health!.innerHTML = "Defeated!!!";
			dead = true;
			round += 1;

			// removes bopping animation
			enemy!.style.animationName = "none";

			// changes eyes of enemy and spawns new enemy
			if (
				left_eye?.style.height !== undefined &&
				left_eye?.clientHeight !== undefined &&
				right_eye?.style.height !== undefined &&
				right_eye?.clientHeight !== undefined
			) {
				if (left_eye.clientHeight > 3) {
					left_eye!.style.height = left_eye?.clientHeight / 2 + "px";
					right_eye!.style.height = right_eye?.clientHeight / 2 + "px";
				} else if (left_eye.clientHeight !== 0) {
					left_eye!.style.height = "0px";
					right_eye!.style.height = "0px";
				} else {
					left_eye!.style.height = "var(--eye_size)";
					right_eye!.style.height = "var(--eye_size)";

					changeEnemyColor();
				}
			}

			// creates new enemy
			setTimeout(() => {
				newEnemy();

				// adds bopping animation
				enemy!.style.animationName = "default-enemy-movement";

				//removes money effect
				money_effect!.style.animationName = "none";
			}, 2000);
		}

		// updates displays
		function updateHealth() {
			enemy_health!.innerHTML = hp + "/" + max_hp + " HP";
		}
		function updateRoundCounter() {
			round_counter!.innerHTML = "round: " + round;
		}
		function updateMoneyCounter() {
			money_counter!.innerHTML = money + "$";
		}
		function updateUpgradeDisplay() {
			for (const upgr in upgrade_list) {
				// @ts-ignore
				upgrade_list[upgr].updateDisplay();
			}
		}
		function updateRythmDisplay() {
			if (rythm_bar_deg > 360 || in_frenzy_mode) {
				rythm_bar_deg = 360;
			}

			// rotates rythm bar
			if (rythm_bar_deg <= 180) {
				rythm_display_bar!.style.transform = "rotate(" + (225 + rythm_bar_deg) + "deg)";
				rythm_display_cover!.style.transform = "rotate(" + 225 + "deg)";
			} else if (rythm_bar_deg <= 360) {
				rythm_display_cover!.style.transform = "rotate(" + (rythm_bar_deg + 225) + "deg)";
				rythm_display_bar!.style.transform = "rotate(" + (225 + 180) + "deg)";
			}

			if (!in_frenzy_mode) {
				// changes colors and sizes of rythm bar
				if (rythm_bar_deg <= 90) {
					document.documentElement.style.setProperty("--rythm_display_color", "aliceblue");
					rythm_display_bar!.style.borderWidth = "3px";
					rythm_display_bar!.style.width = "calc(var(--upgrade_size) + 2px)";

					rythm_damage_multi = 1;
					rythm_display_text!.innerHTML = rythm_damage_multi + "x";

					document.documentElement.style.setProperty(
						"--rythm_display_border_invisible",
						"var(--rythm_display_border_empty)  var(--rythm_display_border_empty) transparent transparent"
					);
				} else if (rythm_bar_deg <= 180) {
					document.documentElement.style.setProperty("--rythm_display_color", "khaki");
					rythm_display_bar!.style.borderWidth = "3px";
					rythm_display_bar!.style.width = "calc(var(--upgrade_size) + 2px)";

					rythm_damage_multi = 1 + stronger_rythm_info.stat / 4;
					rythm_display_text!.innerHTML = rythm_damage_multi + "x";

					document.documentElement.style.setProperty(
						"--rythm_display_border_invisible",
						"var(--rythm_display_border_empty)  var(--rythm_display_border_empty) transparent transparent"
					);
				} else if (rythm_bar_deg <= 270) {
					document.documentElement.style.setProperty("--rythm_display_color", "darksalmon");
					rythm_display_bar!.style.borderWidth = "5px";
					rythm_display_bar!.style.width = "var(--upgrade_size)";

					rythm_damage_multi = 1 + (stronger_rythm_info.stat / 4) * 2;
					rythm_display_text!.innerHTML = rythm_damage_multi + "x";

					document.documentElement.style.setProperty(
						"--rythm_display_border_invisible",
						"var(--rythm_display_color) var(--rythm_display_color) transparent transparent"
					);
				} else if (rythm_bar_deg <= 350) {
					document.documentElement.style.setProperty("--rythm_display_color", "mediumslateblue");
					rythm_display_bar!.style.borderWidth = "5px";
					rythm_display_bar!.style.width = "var(--upgrade_size)";

					rythm_damage_multi = 1 + (stronger_rythm_info.stat / 4) * 3;
					rythm_display_text!.innerHTML = rythm_damage_multi + "x";

					document.documentElement.style.setProperty(
						"--rythm_display_border_invisible",
						"var(--rythm_display_color) var(--rythm_display_color) transparent transparent"
					);
				} else if (rythm_bar_deg <= 360) {
					document.documentElement.style.setProperty("--rythm_display_color", "darkmagenta");
					rythm_display_bar!.style.borderWidth = "5px";
					rythm_display_bar!.style.width = "var(--upgrade_size)";

					rythm_damage_multi = 1 + stronger_rythm_info.stat;
					rythm_display_text!.innerHTML = rythm_damage_multi + "x";

					document.documentElement.style.setProperty(
						"--rythm_display_border_invisible",
						"var(--rythm_display_color) var(--rythm_display_color) transparent transparent"
					);
				}
			} else {
				// activates frenzy mode benefites
				document.documentElement.style.setProperty("--rythm_display_color", "red");
				rythm_display_bar!.style.borderWidth = "5px";
				rythm_display_bar!.style.width = "var(--upgrade_size)";

				rythm_damage_multi = 1 + stronger_rythm_info.stat * 1.5;
				rythm_display_text!.innerHTML = rythm_damage_multi + "x";

				document.documentElement.style.setProperty(
					"--rythm_display_border_invisible",
					"var(--rythm_display_color) var(--rythm_display_color) transparent transparent"
				);
			}
		}
		function updateFrenzyTimer() {
			frenzy_slider!.innerHTML = "Frenzy in " + Math.floor(current_frenzy_time / 60) + ":" + (current_frenzy_time % 60);
			if ((current_frenzy_time % 60) / 10 < 1) {
				temp_array = frenzy_slider!.innerHTML.split(":");
				frenzy_slider!.innerHTML = temp_array[0] + ":0" + temp_array[1];
			}

			document.documentElement.style.setProperty(
				"--frenzy_slider_percent",
				((current_frenzy_time / frenzy_time) * 100).toString()
			);
		}
		function updateLeagueBar() {
			league_slider!.innerHTML =
				"League rank " + league_lvl + " (" + ((league_click_count / league_requirement) * 100).toFixed(0) + "%)";

			document.documentElement.style.setProperty(
				"--league_slider_percent",
				((league_click_count / league_requirement) * 100).toString()
			);
		}

		function clickEnemy(e: MouseEvent) {
			if (!dead) {
				// deals damage and calculates crits
				dealDamage();

				league_click_count += 1;
				league();

				if (hp > 0) {
					// displays enemy health
					updateHealth();
				} else {
					calculatemoneyMade(e);

					killEnemy();

					//@ts-ignore
					prestige_list[prestige_lvl + 1].update();
				}
			}

			if (!clicked_weak_spot) {
				rythm();
			} else {
				clicked_weak_spot = false;
			}
		}
		// deals damage to enemy (handles killing and more)
		// @ts-ignore
		enemy?.addEventListener(user_interaction, clickEnemy);
		updateRythmDisplay();

		function unlockUpgrades() {
			switch (prestige1_info.num) {
				case 0:
					attack.listenForClick();
					crit_chance.listenForClick();
					break;
				case 1:
					crit_multi.listenForClick();
					crit_multi_upgrade?.classList.remove("locked");
					crit_multi_upgrade?.classList.add("clickable");

					money_multi_upgrade?.classList.remove("invisible");

					attack_prestige.listenForClick();
					crit_chance_prestige.listenForClick();
					break;
				case 2:
					money_multi.listenForClick();
					money_multi_upgrade?.classList.remove("locked");
					money_multi_upgrade?.classList.add("clickable");

					money_multi_stat?.classList.remove("invisible");

					crit_multi_prestige.listenForClick();
					prestige_crit_multi_upgrade?.classList.remove("locked");
					prestige_crit_multi_upgrade?.classList.add("clickable");

					prestige_money_multi_upgrade?.classList.remove("invisible");
					break;
				case 3:
					money_multi_prestige.listenForClick();
					prestige_money_multi_upgrade?.classList.remove("locked");
					prestige_money_multi_upgrade?.classList.add("clickable");
					break;
			}
		}
		unlockUpgrades();

		// adds a "pressed" animation
		function removePressedAnimation(e: Event) {
			if (
				// @ts-ignore;
				e.target!.className.split(" ").filter((string: string) => {
					return string === "clickable";
				}).length !== 0 &&
				// @ts-ignore;
				e.target!.style.boxShadow === "var(--default_shadow) var(--default_shadow) var(--default_shadow_smudge) inset"
			) {
				// @ts-ignore;
				e.target!.style.boxShadow = "";
			}
		}

		addEventListener(user_interaction_start, (e) => {
			if (
				// @ts-ignore;
				e.target!.className.split(" ").filter((string: string) => {
					return string === "clickable";
				}).length !== 0 &&
				// @ts-ignore;
				e.target!.style.boxShadow !== "var(--default_shadow) var(--default_shadow) var(--default_shadow_smudge) inset"
			) {
				// @ts-ignore;
				e.target!.style.boxShadow = "var(--default_shadow) var(--default_shadow) var(--default_shadow_smudge) inset";

				// @ts-ignore
				temp_color_easter_egg = e.target!.style.backgroundColor;
			}
		});

		addEventListener("mouseout", (e) => {
			removePressedAnimation(e);
		});

		addEventListener(user_interaction_end, (e) => {
			removePressedAnimation(e);

			// @ts-ignore
			if (temp_color_easter_egg !== "" && !e.target.classList.contains("clickable-no-animation")) {
				// @ts-ignore
				e.target!.style.backgroundColor = temp_color_easter_egg;
			}
			temp_color_easter_egg = "";
		});

		class Prestige {
			declare listener: null | VoidFunction;
			obj: {
				name: string;
				currency: string;
				lvl: number;

				money_counter_element: elementByID;
				shop_element: elementByID;
				open_shop_element: elementByID;
				close_shop_element: elementByID;

				num: number;
				money: number;

				round: number;
				available: boolean;

				time: number;

				interval: number;

				color: string;
			};
			constructor(obj: {
				name: string;
				currency: string;
				lvl: number;

				money_counter_element: elementByID;
				shop_element: elementByID;
				open_shop_element: elementByID;
				close_shop_element: elementByID;

				num: number;
				money: number;

				round: number;
				available: boolean;

				time: number;

				interval: number;

				color: string;
			}) {
				this.obj = obj;
			}

			update() {
				prestige_button!.innerHTML = this.obj.name + "<br/>" + (round - 1) + "/" + this.obj.round;

				if (round > this.obj.round && !this.obj.available) {
					this.obj.available = true;

					prestige_button?.addEventListener(user_interaction, (this.listener = this.activate.bind(this)));
				}
			}

			changeBackground() {
				let prestige_button_background_color: any;
				if (prestige_lvl === 1 || prestige_lvl === 2 || prestige_lvl === 3) {
					prestige_button_background_color = prestige_list[prestige_lvl].obj.color;
				} else {
					prestige_button_background_color = prestige_list[3].obj.color;
				}
				// converts rgb(x,x,x) into a list
				prestige_button_background_color = prestige_button_background_color.trim().slice(4, -1).split(", ");
				// shifts color
				prestige_button_background_color.forEach((e: string, i: number) => {
					prestige_button_background_color[i] = parseInt(e) - 60;
				});
				// converts list back into rgb format
				prestige_button_background_color = "rgb(" + prestige_button_background_color.join(", ") + ")";
				document.documentElement.style.setProperty("--body_background_color", prestige_button_background_color);

				if (prestige_lvl === 0 || prestige_lvl === 1 || prestige_lvl === 3) {
					document.documentElement.style.setProperty(
						"--prestige_button_color",
						// @ts-ignore
						prestige_list[prestige_lvl + 1].obj.color
					);
				} else {
					document.documentElement.style.setProperty("--prestige_button_color", prestige_list[3].obj.color);
				}
			}

			timer() {
				if (this.obj.interval) {
					clearInterval(this.obj.interval);
				}

				this.obj.interval = setInterval(() => {
					this.obj.time -= 1;

					this.updateTimer();

					if (this.obj.time <= 0) {
						this.deactivate();

						for (const func in prestige_list) {
							// @ts-ignore
							prestige_list[func].reset();
							// @ts-ignore
							if (prestige_list[func].obj.interval) {
								// @ts-ignore
								clearInterval(prestige_list[func].obj.interval);
							}

							// @ts-ignore
							if (typeof prestige_list[func].listener === "function") {
								// @ts-ignore
								prestige_button?.removeEventListener(user_interaction, prestige_list[func].listener);
							}
						}
						this.update();
					}
				}, 1000);
			}
			updateTimer() {
				prestige_timer!.innerHTML = Math.floor(this.obj.time / 60) + ":" + (this.obj.time % 60) + "s";
				if ((this.obj.time % 60) / 10 < 1) {
					temp_array = prestige_timer!.innerHTML.split(":");
					prestige_timer!.innerHTML = temp_array[0] + ":0" + temp_array[1];
				}
			}

			activate() {
				if (this.obj.lvl !== 3) {
					prestige_lvl = this.obj.lvl;

					this.obj.time = (round - 1) * 2;
					this.updateTimer();

					if (this.obj.lvl > 1) {
						prestige1.deactivate();
						defaultPrestigeUpgradeStats();

						prestige_lvl = this.obj.lvl;
					}

					this.changeBackground();
					this.reset();

					// @ts-ignore
					prestige_list[this.obj.lvl + 1].update();

					Start.addStartScreen(null, {
						a: () => {
							this.timer();

							console.log("");
							console.log("You just " + this.obj.name + "d!!!\n" + this.obj.name + " level: " + (this.obj.num + 1));
							console.log("");

							prestige_timer?.classList.remove("invisible");
						},
					});
				} else {
					deleted_save = true;
					gameTime();
					if (typeof total_time === "number") {
						document.body.innerHTML =
							'<div id="game-complete">You Win!!!</div><div id="game-complete-time">Time:' +
							Math.floor(total_time / 1000 / 60 / 60) +
							"h:" +
							(Math.floor(total_time / 1000 / 60) % 60) +
							"m:" +
							(Math.floor(total_time / 1000) % 60) +
							"." +
							(total_time % 1000) +
							"s<br>Your save is being deleted</div>";
					} else {
						('<div id="game-complete">You Win!!!</div><div id="game-complete-time">Error: No Time Recorded<br>Your save is being deleted</div>');
					}
					deleteSave();
				}
			}

			reset() {
				if (typeof this.listener === "function") {
					prestige_button?.removeEventListener(user_interaction, this.listener);
				}
				this.obj.available = false;

				// change this
				defaultStats();

				// updates counter visuals
				updateMoneyCounter();
				updateRoundCounter();
				updateUpgradeDisplay();
				updateRythmDisplay();
				updateFrenzyTimer();

				upgradesPrestigeAfterReset();

				this.update();

				changeEnemyColor();

				if (!dead) {
					newEnemy();
				}

				left_eye!.style.height = "var(--eye_size)";
				right_eye!.style.height = "var(--eye_size)";
			}

			calculateMoney() {
				let money_made: number;
				let roll: number;
				if (prestige_lvl === 1) {
					roll = 1.8;
					money_made = Math.round((roll * round + 1) ** (1 + round ** 1.05 / round ** 1.1) * money_multi_info.stat);
				} else {
					money_made = round;
				}

				this.obj.money += money_made;

				// tells the user how much money they made
				console.log("");
				console.log(
					"You have made: " + money_made + this.obj.currency + "\nyou have: " + this.obj.money + this.obj.currency
				);
				console.log("");

				// adds money effect that displays how much money you got
				prestige_money_effect!.innerHTML = money_made + this.obj.currency;
				prestige_money_effect!.style.animationName = "disappearing-effect";

				setTimeout(() => {
					prestige_money_effect!.style.animationName = "none";
				}, 1500);
			}

			updateMoneyCounter() {
				this.obj.money_counter_element!.innerHTML = this.obj.money + this.obj.currency;
			}

			deactivate() {
				this.obj.num += 1;

				this.calculateMoney();
				this.updateMoneyCounter();

				this.reset();
				if (this.obj.interval) {
					clearInterval(this.obj.interval);
				}

				unlockUpgrades();

				prestige_lvl = 0;
				document.documentElement.style.setProperty("--body_background_color", "darkolivegreen");
				document.documentElement.style.setProperty("--prestige_button_color", "rgb(219, 122, 105)");

				prestige_timer?.classList.add("invisible");

				if (this.obj.num > 0 && this.obj.open_shop_element?.classList.contains("invisible")) {
					this.obj.open_shop_element?.classList.remove("invisible");
					this.openShop();
					this.closeShop();
				}
				if (this.obj.lvl !== 3 && !deleted_save) {
					save();
				}
			}

			openShop() {
				this.obj.open_shop_element?.addEventListener(user_interaction, () => {
					darken_background?.classList.remove("invisible");
					this.obj.shop_element?.classList.remove("invisible");
				});
			}
			closeShop() {
				this.obj.close_shop_element?.addEventListener(user_interaction, () => {
					darken_background?.classList.add("invisible");
					this.obj.shop_element?.classList.add("invisible");
				});
			}
		}

		let prestige3 = new Prestige(prestige3_info);
		prestige3.update();

		let prestige2 = new Prestige(prestige2_info);
		prestige2.update();

		let prestige1 = new Prestige(prestige1_info);
		prestige1.update();

		let prestige_list = {
			1: prestige1,
			2: prestige2,
			3: prestige3,
		};

		prestige_button!.style.boxShadow = "var(--default_shadow) var(--default_shadow) var(--default_shadow_smudge)";

		// add prestige shop functionality

		// redo code and var names
		function rythm() {
			date = new Date();
			current_click_time = date.getTime();

			// saves a list of the last 3 click times (compared to the last click time)
			click_differences = click_differences.slice(1);
			click_differences.push(Math.abs(current_click_time - last_click_time));
			last_click_time = current_click_time;

			// calculates the avrage difference in between click times
			click_differences.forEach((e, i) => {
				time_difference = 0;
				time_difference += e - click_differences[0] + e - click_differences[1] + e - click_differences[2];
				time_difference /= 2;
				click_differences_time_difference[i] = Math.abs(time_difference);
			});

			// decides if it should add or subtract degs
			if (
				click_differences_time_difference.filter((e) => {
					return e < 27.5;
				}).length === 3
			) {
				if (rythm_bar_deg < 360) {
					rythm_bar_deg += 15;
					updateRythmDisplay();
				}
			} else if (rythm_bar_deg > 0) {
				rythm_bar_deg -= 5;
				updateRythmDisplay();
			}

			if (
				click_differences_time_difference.filter((e) => {
					return e === 0;
				}).length === 3
			) {
				window.alert("Autoclicker protection!!!");
			}
		}
		// 4 times a second it removes 5 degs
		setInterval(() => {
			if (rythm_bar_deg > 0) {
				rythm_bar_deg -= 5;

				updateRythmDisplay();
			}
		}, 250);

		// every 2 mins you do 1.75x damage
		updateFrenzyTimer();
		function frenzy() {
			rythm_bar_deg = 0;
			updateRythmDisplay();

			frenzy_count_down = setInterval(() => {
				if (!in_frenzy_mode) {
					current_frenzy_time -= 1;
					updateFrenzyTimer();
				}
				// actiates frenzy mode
				if (current_frenzy_time === 0) {
					in_frenzy_mode = true;

					current_frenzy_time = frenzy_time;
					frenzy_progress_bar!.style.backgroundColor = "var(--frenzy_slider_color)";
					updateFrenzyTimer();

					updateRythmDisplay();

					clearInterval(frenzy_count_down);

					frenzy_count_down = setInterval(() => {
						current_frenzy_time -= 1;
						updateFrenzyTimer();
						// deactivates frenzy mode
						if (current_frenzy_time === 0 || in_frenzy_mode === false) {
							in_frenzy_mode = false;

							current_frenzy_time = frenzy_time;
							frenzy_progress_bar!.style.backgroundColor = "var(--slider_color)";
							updateFrenzyTimer();

							clearInterval(frenzy_count_down);

							frenzy();
						}
					}, 150);
				}
			}, 1000);
		}

		function league() {
			updateLeagueBar();
			// levels up league
			if (league_click_count >= league_requirement) {
				league_lvl += 1;
				league_requirement = Math.round(((league_lvl + 1) * 50) ** (1 + league_lvl / 100));
				league_click_count = 0;

				// gives level up reward
				let money_made = league_lvl * 20;
				prestige1_info.money += money_made;
				prestige1.updateMoneyCounter();

				// tells the user how much money you made
				console.log("");
				console.log(
					"You have leveled up your league rank to lvl " +
						league_lvl +
						"\nyou have made: " +
						money_made +
						prestige1_info.currency +
						"\nyou have: " +
						prestige1_info.money +
						prestige1_info.currency
				);
				console.log("");

				// adds money effect that displays how much money you got
				prestige_money_effect!.innerHTML = money_made + prestige1_info.currency;
				prestige_money_effect!.style.animationName = "disappearing-effect";

				setTimeout(() => {
					prestige_money_effect!.style.animationName = "none";
				}, 1500);
			}
		}

		function upgradesPrestigeAfterReset() {
			for (let x = 0; x < attack_prestige_info.lvl; x++) {
				attack_info.stat = Math.round(increase_attack() * 1.05);
			}
			for (let x = 0; x < crit_chance_prestige_info.lvl; x++) {
				crit_chance_info.stat += 0.0045;
			}
			for (let x = 0; x < crit_multi_prestige_info.lvl; x++) {
				crit_multi_info.stat += 0.0105;
			}
			for (let x = 0; x < money_multi_prestige_info.lvl; x++) {
				money_multi_info.stat += 0.11;
			}

			attack_stat!.innerHTML = "Attack = " + attack_info.stat;
			crit_chance_stat!.innerHTML = "Crit Chance = " + (crit_chance_info.stat * 100).toFixed(2) + "%";
			crit_multi_stat!.innerHTML =
				"Crit Multiplier = " + (attack_info.stat ** crit_multi_info.stat / attack_info.stat).toFixed(2) + "x";
			money_multi_stat!.innerHTML = "Money Multiplier = " + money_multi_info.stat.toFixed(2) + "x";
		}
		function upgradesSuperPrestigeAfterLoad() {
			for (let x = 0; x < add_round_damage_info.lvl; x++) {
				add_round_damage_info.increaseStats();
			}
			for (let x = 0; x < stronger_rythm_info.lvl; x++) {
				stronger_rythm_info.increaseStats();
			}
			for (let x = 0; x < less_random_money_info.lvl; x++) {
				less_random_money_info.increaseStats();
			}
			for (let x = 0; x < max_money_info.lvl; x++) {
				max_money_info.increaseStats();
			}
		}

		function randomWeakSpot() {
			if (enemy?.clientHeight && enemy.clientWidth) {
				weak_spot_location[0] = Math.random() * (enemy?.clientWidth - enemy_boarder_radius * 2) + enemy_boarder_radius;
				weak_spot_location[1] = Math.random() * (enemy?.clientHeight - enemy_boarder_radius * 2) + enemy_boarder_radius;

				weak_spot!.style.left = weak_spot_location[0] + "px";
				weak_spot!.style.top = weak_spot_location[1] - enemy?.clientHeight / 2 + "px";
			}
		}
		randomWeakSpot();

		function clickWeakSpot() {
			if (!dead) {
				clicked_weak_spot = true;
				rythm_bar_deg += 10;
				enemy?.dispatchEvent(new Event("click"));
				randomWeakSpot();
			}
		}
		weak_spot?.addEventListener(user_interaction, clickWeakSpot);

		load();
	}, 50);
});
