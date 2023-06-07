class make_html_table{
	/*
	Element dla użytkownika
	tablica z zapytania php do bazy select
	*/
	ARRAY_OF_OBJECTS = undefined;
	/*
	Element dla użytkownika
	tablica sterująca które kolumny mają być przetworzone, głównym kluczem jest klucz z tablicy ARRAY_OF_OBJECTS
	w tej tablicy są również pola pokazujące jak należy formatować komórki, mogą to być też funkcje
	[
		{
			\'session_name\':{
				\'th_caption\': \'Session Name\',
				\'th\': {
					\'class\': \'session_manager_th\'
				},
				\'td\': {
					\'class\' : \'session_manager_td\'
				}
			}
		},
	]
	*/
	KEYS_TO_SHOW = undefined;
	/*
	Element dla użytkownika
	Tablica nakazująca wstawienie jakiegoś znacznika HTML np <input>
	wstawiania odbywa się po kluczu. Może być kilka znaczników
	{
		\'select\':
		[
			{
				\'checkbox\':
				{
					\'name\' : \'session_id[]\',
					\'value\' : function(a, b ){
						return \'value=\"\'+a[\'select\' ]+\'\"\';
					},
					\'readonly\' : function(a, b ){
						return a[\'session_name\' ] == \''.MSSH::$SESSION_NAME.'\'?\'readonly\':undefined;
					},
					\'disabled\' : function(a, b ){
						return a[\'session_name\' ] == \''.MSSH::$SESSION_NAME.'\'?\'disabled\':undefined;
					},
					\'style\' : function(a, b ){
						return a[\'session_name\' ] == \''.MSSH::$SESSION_NAME.'\'?\'style=\"cursor: not-allowed\"\':undefined;
					}
				}
			}
		]
	};
	*/
	INSERT = undefined;
	
	//Nie istotny dla użytkownika, tablica zapisująca osatni sortujący klucz
	key_to_sort_by = new Object();
	
	//Nie istotny dla użytkownika, zmienna sterująca robiąca raz th przy jednym przebiegu wiersza
	make_th_row = true;

	//Nie istotny dla użytkownika, wiersz th raczej globalny choć można go tworzyć lokalnie w funkcji robiącej wiersz tr
	th_row = '';
	
	constructor(ARRAY_OF_OBJECTS ){
		this.ARRAY_OF_OBJECTS = ARRAY_OF_OBJECTS;
	}
	make_table(TABLE_ATRIBUTES ){
		let table_properties = '';
		let td_rows = '';
		//sprawdza zgodność ARRAY_OF_OBJECTS
		if(this.ARRAY_OF_OBJECTS && this.ARRAY_OF_OBJECTS.constructor === Array ){
			//robię wiersze tabeli
			for(let row_count = 0; row_count < this.ARRAY_OF_OBJECTS.length; row_count++){
				td_rows += this.make_row(this.ARRAY_OF_OBJECTS[row_count ] );
				this.make_th_row = false;
			}
			//dodaję atrybuty tabeli
			if(td_rows && typeof TABLE_ATRIBUTES == 'object' ){
				for(let table_property in TABLE_ATRIBUTES ){
					if(TABLE_ATRIBUTES.hasOwnProperty(table_property ) ){
						let value_of_property = typeof TABLE_ATRIBUTES[table_property ] == 'function'?TABLE_ATRIBUTES[table_property ](this.ARRAY_OF_OBJECTS ):TABLE_ATRIBUTES[table_property ];
						if(value_of_property ){
							table_properties += typeof TABLE_ATRIBUTES[table_property ] == 'function'?value_of_property+' ':table_property+'="'+value_of_property+'" ';
						}
					}
				}
			}
		}
		else{
			console.error('ARRAY_OF_OBJECTS ma nieprawidłowy format' );
		}
		return this.th_row || td_rows?'<table '+table_properties+'>'+this.th_row+td_rows+'</table>':'';
	}
	make_row(ROW ){
		let row_of_td = '';
		let inserts = undefined;
		//Tablica kluczy
		if(this.KEYS_TO_SHOW && this.KEYS_TO_SHOW.constructor === Array ){
			//Czyta klucze kolejno
			for(let keys_count = 0; keys_count < this.KEYS_TO_SHOW.length; keys_count++ ){
				for(let key_to_show in this.KEYS_TO_SHOW[keys_count ] ){
					/*Robi komurkę i inserty ewentualnie*/
					if(ROW[key_to_show ] !== undefined ){
						/*Robi Inserta*/
						//tu można tworzyć inserts
						if(this.INSERT && this.INSERT[key_to_show ] !== undefined && this.INSERT[key_to_show ].constructor === Array ){
							//Inserty są w tablicy
							for(let tags_count = 0; tags_count < this.INSERT[key_to_show ].length; tags_count++ ){
								//Insert
								if(typeof this.INSERT[key_to_show ][tags_count ] == 'object' ){
									//jeden tag
									for(let tag_name in this.INSERT[key_to_show ][tags_count ] ){
										if(typeof this.INSERT[key_to_show ][tags_count ][tag_name ] == 'object' ){
											let tag_properties = '';
											for(let tag_property in this.INSERT[key_to_show ][tags_count ][tag_name ] ){
												let value_of_property = typeof this.INSERT[key_to_show ][tags_count ][tag_name ][tag_property ] == 'function'?this.INSERT[key_to_show ][tags_count ][tag_name ][tag_property ](ROW, key_to_show ):this.INSERT[key_to_show ][tags_count ][tag_name ][tag_property ];
												if(value_of_property ){
													tag_properties += typeof this.INSERT[key_to_show ][tags_count ][tag_name ][tag_property ] == 'function'?
													value_of_property+' ':
													tag_property+'="'+value_of_property+'" ';
												}
											}
											inserts += this.close_insert(tag_name, tag_properties, ROW[key_to_show ] );
										}
										else{
											console.error('INSERT[${key_to_show} ][${tags_count} ][${tag_name} ] nie jest obiektem' );
										}
									}
								}
								else{
									console.error('INSERT[${key_to_show} ][${tags_count} ] nie jest obiektem' );
								}
							}
						}
						else if(this.INSERT && this.INSERT[key_to_show ] !== undefined ){
							console.error('INSERT[${key_to_show} ] nie jest tablicą obiektów' );
						}
						/*Robi th. musi tworzyć żeby zgadzały się kolumny*/
						if(this.make_th_row ){
							let th_properties = '';
							if(typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ] == 'object' && typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ]['th' ] == 'object' ){
								for(let th_property in this.KEYS_TO_SHOW[keys_count ][key_to_show ]['th' ] ){
									let value_of_property = typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ]['th' ][th_property ] == 'function'?this.KEYS_TO_SHOW[keys_count ][key_to_show ]['th' ][th_property ](ROW, key_to_show, th_property ):this.KEYS_TO_SHOW[keys_count ][key_to_show ]['th' ][th_property ];
									if(value_of_property ){
										th_properties += typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ]['th' ][th_property ] == 'function'?value_of_property+' ':th_property+'="'+value_of_property+'" ';
									}
								}
								
							}
							this.th_row += '<th '+th_properties+'>'+this.KEYS_TO_SHOW[keys_count ][key_to_show ]['th_caption' ]+'</th>';
						}
						/*Robi td. musi tworzyć żeby zgadzały się kolumny*/
						let td_properties = '';
						if(typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ] == 'object' && typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ]['td' ] == 'object' ){
							for(let td_property in this.KEYS_TO_SHOW[keys_count ][key_to_show ]['td' ] ){
								let value_of_property = typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ]['td' ][td_property ] == 'function'?this.KEYS_TO_SHOW[keys_count ][key_to_show ]['td' ][td_property ](ROW, key_to_show, td_property ):this.KEYS_TO_SHOW[keys_count ][key_to_show ]['td' ][td_property ];
								if(value_of_property ){
									td_properties += typeof this.KEYS_TO_SHOW[keys_count ][key_to_show ]['td' ][td_property ] == 'function'?value_of_property+' ':td_property+'="'+value_of_property+'" ';
								}
							}
						}
						row_of_td += '<td '+td_properties+'>'+(inserts?inserts:ROW[key_to_show ] )+'</td>';
						inserts = '';
					}
					//koniec robienia komurki bo klucz był w wierszu
				}
			}
		}
		else{
			console.error('keys_to_show ma nieprawidłowy format' );
		}
		return row_of_td?'<tr >'+row_of_td+'</tr>':'';
	}
	close_insert(TAG, TAG_PROPERTIES, VALUE ){
		if(TAG == 'checkbox' ){
			return '<input type="checkbox" '+TAG_PROPERTIES+'>';
		}
		else{
			console.warn('Nieznaleziono takiej definicji TAGA' );
		}
		return TAG_PROPERTIES;
	}
	sort(KEY_TO_SORT_BY ){
		if(this.ARRAY_OF_OBJECTS && this.ARRAY_OF_OBJECTS.constructor === Array ){
			this.key_to_sort_by[KEY_TO_SORT_BY ] = this.key_to_sort_by[KEY_TO_SORT_BY ]?false:true;
			if(this.key_to_sort_by[KEY_TO_SORT_BY ] ){
				return this.ARRAY_OF_OBJECTS.sort(
					function(a, b ){
						const nameA = a[KEY_TO_SORT_BY ].toUpperCase();
						const nameB = b[KEY_TO_SORT_BY ].toUpperCase();
						if(nameA < nameB ){
							return 1;
						}
						if(nameA > nameB ){
							return -1;
						}
						return 0;
					}
				);
			}
			else{
				return this.ARRAY_OF_OBJECTS.sort(
					function(a, b ){
						const nameA = a[KEY_TO_SORT_BY ].toUpperCase();
						const nameB = b[KEY_TO_SORT_BY ].toUpperCase();
						if(nameA < nameB ){
							return -1;
						}
						if(nameA > nameB ){
							return 1;
						}
						return 0;
					}
				);
			}
		}
		else{
			console.error('ARRAY_OF_OBJECTS ma nieprawidłowy format' );
		}
	}
}