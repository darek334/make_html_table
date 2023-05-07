class make_html_table{

	//tablica po zapytaniu z bazy
	array_of_objects = undefined;
	//id w który wstawiamy tablicę HTML
	innerHTML_element_id = undefined;
	//schemat kluczy do wyświetlenia z polami
	/*
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
	keys_to_show = new Array();
	//schemat tablicy z dodatkowymi polami do dodana do tablicy
	/*
	{
		\'session_name\':
			[
				{
					\'checkbox\' :{
						\'position\': false,
						\'th_caption\': \'\',
						\'th\': {
							\'class\': \'session_manager_th\',
						},
						\'td\': {
							\'class\': \'session_manager_td\'
						},
						\'properties\': {
							\'name\' : \'session_name\',
							//a=session_name, b=ROW[session_name], c=value
							\'value\' : function(a, b, c ){return b }
						}
					}
				},
				{
					\'insert\' :{
						\'th_caption\': \'Sessions\',
						\'position\': false,
						\'th\': {
							\'class\': \'session_manager_th\'
						},
						\'td\': {
							\'class\': \'session_manager_td\'
						},
						\'insertion\' : function(a, b ){
										return b == \''.MSSH::$SESSION_NAME.'\'?\'Current Session\':\'Other Session\';
									}
					}
				}
			]
	};
	*/
	add_td_by_key = undefined;
	//tablica pomocna przy sortowaniu, czyli kilkukrotnym kliknięciu w nagłówek
	key_to_sort_by = new Object();
	//zmienna sterująca do robienia wiersza nagłówków
	make_th_row = true;
	//oddzielny wiersz z nagłówkami
	th_row = '';
	/*konstruktor z najważniejszymi zmiennymi. Bez sprawdzania.
	Zmienna są dostępne pubicznie a więc powinny być sprawdzane tam gdzie się ich używa, a więc w funkcjach.
	Po co je tutaj sprwdzać skoro można je ustawić publicznie*/
	constructor(ARRAY_OF_OBJECTS, INNERHTML_ELEMENT_ID, KEYS_TO_SHOW ){
		this.array_of_objects = ARRAY_OF_OBJECTS;
		this.innerHTML_element_id = INNERHTML_ELEMENT_ID;
		this.keys_to_show = KEYS_TO_SHOW;
	}
	/*Główna funkcja. Pobiera wiersz i wywołuje funkcję robiącą wiersz.
	Po jednym wywołaniu robienia wiersza zmienna robiąca wiersz nagłówków zosaje wyłączona.*/
	make_table(TABLE_ATRIBUTES ){
		let table_properties = '';
		let td_rows = '';
		if(this.array_of_objects && this.array_of_objects.constructor === Array ){
			for(let row_of_table_count = 0; row_of_table_count < this.array_of_objects.length; row_of_table_count++){
				td_rows += this.make_row(this.array_of_objects[row_of_table_count ] );
				this.make_th_row = false;
			}
			if(td_rows && typeof TABLE_ATRIBUTES == 'object' ){
				for(let table_atribute in TABLE_ATRIBUTES ){
					table_properties += table_atribute+'="'+TABLE_ATRIBUTES[table_atribute ]+'" ';
				}
			}
		}
		else{
			console.error('array_of_objects ma nieprawidłowy format' );
		}
		return this.th_row || td_rows?'<table '+table_properties+'>'+this.th_row+td_rows+'</table>':'';
	}
	/*funkcja robiąca wiersz a więc zwracająca wiersz w formie <tr></tr>
	Funkcja ma tylka za zadanie sprawdzenie kluczy i wywołanie formatowania komórek również dodatkowych
	Ponieważ wywołuje się dodatkowe komórki to zwykłe komórki tez się robi w funkcji formatującej dodatkowe komórki*/
	make_row(ROW ){
		let row_of_td = '';
		if(this.keys_to_show && this.keys_to_show.constructor === Array ){
			for(let keys_count = 0; keys_count < this.keys_to_show.length; keys_count++ ){
				for(let key_to_show in this.keys_to_show[keys_count ] ){
					if(ROW[key_to_show ] !== undefined ){
						row_of_td += this.make_additional_td_by_key(key_to_show, ROW[key_to_show ], this.keys_to_show[keys_count ][key_to_show ] );
					}
				}
			}
		}
		else{
			console.error('keys_to_show ma nieprawidłowy format' );
		}
		return row_of_td?'<tr >'+row_of_td+'</tr>':'';
	}
	make_additional_td_by_key(KEY, VALUE, KEY_TO_SHOW_PROPERTIES ){
		
		let sum_of_th = '';
		let sum_of_td = '';
		/*musi tworzyć żeby zgadzały się kolumny*/
		if(this.make_th_row ){
			let th_properties = '';
			if(typeof KEY_TO_SHOW_PROPERTIES == 'object' ){
				for(let th_property in KEY_TO_SHOW_PROPERTIES['th' ] ){
					th_properties += th_property+'="'+(typeof KEY_TO_SHOW_PROPERTIES['th' ][th_property ] == 'function'?KEY_TO_SHOW_PROPERTIES['th' ][th_property ](KEY, VALUE ):KEY_TO_SHOW_PROPERTIES['th' ][th_property ] )+'" ';
				}
				
			}
			sum_of_th = '<th '+th_properties+'>'+KEY_TO_SHOW_PROPERTIES['th_caption' ]+'</th>';
		}
		/*musi tworzyć żeby zgadzały się kolumny*/
		let td_properties = '';
		if(typeof KEY_TO_SHOW_PROPERTIES == 'object' && KEY_TO_SHOW_PROPERTIES['td' ] ){
			for(let td_property in KEY_TO_SHOW_PROPERTIES['td' ] ){
				td_properties += td_property+'="'+(typeof KEY_TO_SHOW_PROPERTIES['td' ][td_property ] == 'function'?KEY_TO_SHOW_PROPERTIES['td' ][td_property ](KEY, VALUE ):KEY_TO_SHOW_PROPERTIES['td' ][td_property ] )+'" ';
			}
		}
		sum_of_td = '<td '+td_properties+'>'+VALUE+'</td>';
		/*czy jest dodatkowy tag*/
		if(this.add_td_by_key[KEY ] && this.add_td_by_key[KEY ].constructor === Array ){
			for(let tag_to_add_count = 0; tag_to_add_count < this.add_td_by_key[KEY ].length; tag_to_add_count++ ){
				if(typeof this.add_td_by_key[KEY ][tag_to_add_count ] == 'object' ){
					for(let tag_to_add in this.add_td_by_key[KEY ][tag_to_add_count ] ){
						let tag_to_add_th_properties = '';
						let tag_to_add_td_properties = '';
						let tag_to_add_properties = '';
						if(typeof this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ] == 'object' ){
							/*tag properties*/
							if(tag_to_add == 'insert' ){
								tag_to_add_properties = (typeof this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['insertion' ] == 'function'?this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['insertion' ](KEY, VALUE ):this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['insertion' ] )+' ';
							}
							else{
								for(let tag_to_add_propertie in this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['properties' ] ){
									
									let value_of_property = typeof this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['properties' ][tag_to_add_propertie ] == 'function'?
									this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['properties' ][tag_to_add_propertie ](KEY, VALUE, tag_to_add_propertie ):
									this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['properties' ][tag_to_add_propertie ];
									
									if(value_of_property ){
										tag_to_add_properties += typeof this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['properties' ][tag_to_add_propertie ] == 'function'?value_of_property+' ':
										tag_to_add_propertie+'="'+value_of_property+'" ';
									}
								}
							}
							/*th properties*/
							if(this.make_th_row ){
								for(let tag_to_add_th_propertie in this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['th' ] ){
									tag_to_add_th_properties += tag_to_add_th_propertie+'="'+(typeof this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['th' ][tag_to_add_th_propertie ] == 'function'?this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['th' ][tag_to_add_th_propertie ](KEY, VALUE ):this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['th' ][tag_to_add_th_propertie ] )+'" ';
								}
							}
							/*td properties*/
							for(let tag_to_add_td_propertie in this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['td' ] ){
								tag_to_add_td_properties += tag_to_add_td_propertie+'="'+(typeof this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['td' ][tag_to_add_td_propertie ] == 'function'?this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['td' ][tag_to_add_td_propertie ](KEY, VALUE ):this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['td' ][tag_to_add_td_propertie ] )+'" ';
							}
						}
						/*dodawanie th i td po to żeby zgadzały się kolumny*/
						if(this.make_th_row ){
							sum_of_th = this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['position' ]?
							sum_of_th+'<th '+tag_to_add_th_properties+'>'+this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['th_caption' ]+'</th>':
							'<th '+tag_to_add_th_properties+' >'+this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['th_caption' ]+'</th>'+sum_of_th;
						}
						sum_of_td = this.add_td_by_key[KEY ][tag_to_add_count ][tag_to_add ]['position' ]?
						sum_of_td+'<td '+tag_to_add_td_properties+'>'+this.close_tag(tag_to_add, tag_to_add_properties )+'</td>':
						'<td '+tag_to_add_td_properties+'>'+this.close_tag(tag_to_add, tag_to_add_properties )+'</td>'+sum_of_td;
					}
				}
			}
		}
		if(this.make_th_row ){
			this.th_row += sum_of_th;
		}
		return sum_of_td;
	}
	close_tag(TAG, TAG_PROPERTIES ){
		if(TAG == 'checkbox' ){
			return '<input type="checkbox" '+TAG_PROPERTIES+'>';
		}
		else if(TAG == 'insert' ){
			return TAG_PROPERTIES;
		}
		else{
			console.warn('Nieznaleziono takiej definicji TAGA' );
		}
		return '';
	}
	sort(KEY_TO_SORT_BY ){
		if(this.array_of_objects && this.array_of_objects.constructor === Array ){
			this.key_to_sort_by[KEY_TO_SORT_BY ] = this.key_to_sort_by[KEY_TO_SORT_BY ]?false:true;
			if(this.key_to_sort_by[KEY_TO_SORT_BY ] ){
				return this.array_of_objects.sort(
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
				return this.array_of_objects.sort(
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
			console.error('array_of_objects ma nieprawidłowy format' );
		}
	}
}