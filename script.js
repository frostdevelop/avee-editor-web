/*
Todo:
Get rid of fsort (it sucks)
Make code actually readable
Add mvarf and mvarf2 options
Add Custom Shader effect
*/
class fsort{
	static errorsuppress = false;
	static quickSort(arr,carr=null){
		carr || (carr = [...arr.keys()]);
		if(arr.length > 3){
			const oesval = fsort.errorsuppress;
			const harr = Math.trunc(arr.length/2);
			const earr = arr.length-1;
			const pivsort = fsort.tsort([arr[0],arr[harr],arr[earr]],[carr[0],carr[harr],carr[earr]]);
			arr[0] = pivsort[0][0];
			arr[earr] = pivsort[0][2];
			arr.splice(harr,1);
			arr.push(pivsort[0][1]);
			carr[0] = pivsort[1][0];
			carr[earr] = pivsort[1][2];
			carr.splice(harr,1);
			carr.push(pivsort[1][1]);
			let temp;
			let si = -1;
			for(let i=0;i<arr.length;i++){
				if(arr[i]<=arr[earr]){
					++si;
					if(i>si){
						temp = carr[i];
						carr[i] = carr[si];
						carr[si] = temp;
						temp = arr[i]
						arr[i] = arr[si];
						arr[si] = temp;
					}
				}
			}
			fsort.errorsuppress = true;
			temp = fsort.quickSort(arr.slice(0,si),carr.slice(0,si));
			arr.splice(0,si,...temp[0]);
			carr.splice(0,si,...temp[1]);
			fsort.errorsuppress = true;
			temp = fsort.quickSort(arr.slice(si+1),carr.slice(si+1));
			arr.splice(si+1,temp[0].length,...temp[0]);
			carr.splice(si+1,temp[1].length,...temp[1]);
			fsort.errorsuppress = oesval;
			return [arr,carr];
		}else if(arr.length === 3){
			return fsort.tsort(arr,carr);
		}else if(arr.length === 2){
			!fsort.errorsuppress && console.warn("fsort.quickSort : Attempting to sort a length 2 array.");
			return (arr[0] > arr[1] ? [arr.toReversed(),carr.toReversed()] : [arr,carr]);
		}else{
			!fsort.errorsuppress && console.warn("fsort.quickSort : Array length is 0 or 1 no sort needed."); //throw new RangeError();
			return [arr,carr];
		}
	}
	static tsort(arr,carr=null){
		const indices = new Uint8Array(3);
		if(arr[1] < arr[0]){
				if(arr[2] < arr[0]){
						if(arr[2] < arr[1]){
								indices[0] = 2;
								indices[1] = 1;
						}else{
								indices[0] = 1;
								indices[1] = 2;
						}
				}else{
						indices[0] = 1;
						indices[2] = 2;
				}
		}else if(arr[2] < arr[0]){
				indices[0] = 2;
				indices[2] = 1;
		}else if(arr[2] < arr[1]){
			indices[1] = 2;
			indices[2] = 1;
		}else{
			indices[1] = 1;
			indices[2] = 2;
		}
		return [[arr[indices[0]],arr[indices[1]],arr[indices[2]]],(carr ? [carr[indices[0]],carr[indices[1]],carr[indices[2]]] : indices)];
	}
}
fsort.errorsuppress = true;
class aveesys{
	constructor(fileinp,status,structure,exportbtn,filenameinp,controls,filecont,entrytemplate,imginp,addCompositionButton,comptemplate,effecttemplate){
		this.fileinp = fileinp;
		this.exportbtn = exportbtn;
		this.filenameinp = filenameinp;
		this.controls = controls;
		this.status = status;
		this.structure = structure;
		this.scenedata = null;
		this.filecont = filecont;
		this.entrytemplate = entrytemplate;
		this.comptemplate = comptemplate;
		this.effecttemp = effecttemplate;
		this.imginp = imginp;
		this.addCompositionButton = addCompositionButton;
		this.images = [];
		this.compelms = [];
		this.processFiles = this.processFiles.bind(this);
		this.saveFile = this.saveFile.bind(this);
		this.addImage = this.addImage.bind(this);
		this.addComposition = this.addComposition.bind(this);
		this.fileinp.addEventListener('change',this.processFiles);
		this.exportbtn.addEventListener('click',this.saveFile);
		this.imginp.addEventListener('change',this.addImage);
		this.addCompositionButton.addEventListener('click',this.addComposition);
	}
	addComposition(){
		if(!this.scenedata){
			alert('Please import a visualizer first!');
			return;
		}
		const comp = {
			objType: "Composition",
			v:"Composition",
			ver:"10",
			_name:"Composition",
			elements:[],
			allowRecursion:{ v: 0, t: "b", o: 4, tag:'misc' },
			introBlendMode:{'o':0,'t':'sel Alpha AddAlpha','tag':'2_introOutro','v':'Alpha'},
			introFadeColor:{"hint": "","o": 3,"t": "crgba","tag": "2_introOutro","v": -553648128},
			introFadeDuration:{"hint": "","o": 1,"t": "f 0 10","tag": "2_introOutro","v": 0},
			outroFadeDuration:{"hint": "","o": 2,"t": "f 0 10","tag": "2_introOutro","v": 0},
		};
		this.scenedata.compositions.push(comp);
		const compelm = this.createCompBase(this.scenedata.compositions.length-1);
		this.structure.appendChild(compelm);
		this.updateStatus(4);
	}
	addImage(){
		if(this.imginp.files.length === 0){
			alert("No files selected!");
			return;
		}
		for(let i=0;i<this.imginp.files.length;i++){
			this.images.push([this.imginp.files[i].name,this.imginp.files[i]]);
		}
		this.updateStatus(1);
	}
	async processFiles(){
		this.scenedata = null;
		//console.log(this.fileinp.files.length);
		if(this.fileinp.files.length === 0){
			alert("No files selected!");
			return;
		}else if(this.fileinp.files.length > 1){
			alert("Multiple files selected! Processing first.");
		}
		const extension = this.fileinp.files[0].name.substr(this.fileinp.files[0].name.length-4);
		if(extension != '.viz' && extension != '.zip'){
			alert("File isn't a viz file!");
			return;
		}
		this.filenameinp.value = this.fileinp.files[0].name;
		/*
		const fr = new FileReader();
		fr.onload = ()=>{
		
		}
		fr.readAsArrayBuffer(this.fileinp.files[0]);
		*/
		let scenedata = null;
		try{
			const entries = await (new zip.ZipReader(new zip.BlobReader(this.fileinp.files[0]))).getEntries();
			this.images.length = 0;
			for(let i=0;i<entries.length;i++){
				if(entries[i].filename === 'scene.json'){
					scenedata = JSON.parse(await (await entries[i].getData(new zip.BlobWriter())).text());
				}else{
					const tempwriter = new zip.BlobWriter;
					await entries[i].getData(tempwriter);
					this.images.push([entries[i].filename,await tempwriter.getData()]);
				}
			}
		}catch(e){
			alert('There was an error reading the file! (log)');
			console.log(e.stack);
			return;
		}
		//parent.console.log(this.images);
		if(!scenedata){
			alert("Invalid file format!");
			return;
		}
		this.scenedata = scenedata;
		console.log(scenedata);
		this.updateStatus();
	}
	createEffectBase(i,j,compelm){
		const elm = this.scenedata.compositions[i].elements[j];
		const basenode = this.effecttemp.content.cloneNode(true);
		const genelm = basenode.getElementById('details');
		genelm.removeAttribute('id');
		const gensummary = basenode.getElementById('title');
		gensummary.innerText = elm._name;
		gensummary.removeAttribute('id');
		const delbtn = basenode.getElementById('delete');
		delbtn.removeAttribute('id');
		delbtn.addEventListener('click',()=>{
			if(confirm('Are you sure you want to delete this effect?')){
				genelm.remove();
				const ind = this.scenedata.compositions[compelm.value].elements.indexOf(elm);
				ind != -1 && this.scenedata.compositions[compelm.value].elements.splice(ind,1);
			}
		});
		const upbtn = basenode.getElementById('upbtn');
		upbtn.removeAttribute('id');
		upbtn.addEventListener('click',()=>{
			//console.log(compelm.value);
			const ind = this.scenedata.compositions[compelm.value].elements.indexOf(elm);
			if(ind > 0){
				const temp = this.scenedata.compositions[compelm.value].elements[ind];
				this.scenedata.compositions[compelm.value].elements[ind] = this.scenedata.compositions[compelm.value].elements[ind-1];
				this.scenedata.compositions[compelm.value].elements[ind-1] = temp;
				compelm.insertBefore(genelm,genelm.previousElementSibling);
				const iconsgen = Array.from(genelm.getElementsByClassName('icon')).concat(Array.from(genelm.nextElementSibling.getElementsByClassName('icon')));
				for(let k=0;k<iconsgen.length;k++){
					const animates = Array.from(iconsgen[k].getElementsByTagName('animateTransform')).concat(Array.from(iconsgen[k].getElementsByTagName('animate')));
					for(let l=0;l<animates.length;l++){
						animates[l].setAttribute('begin', animates[l].getAttribute('begin')); //iconsgen[k].id + '.' + animates[l].getAttribute('begin').split('.')[1]
					}
				}
			};
		});
		const downbtn = basenode.getElementById('downbtn');
		downbtn.removeAttribute('id');
		downbtn.addEventListener('click',()=>{
			const ind = this.scenedata.compositions[compelm.value].elements.indexOf(elm);
			if(ind != -1 && ind < this.scenedata.compositions[compelm.value].elements.length-1){
				const temp = this.scenedata.compositions[compelm.value].elements[ind];
				this.scenedata.compositions[compelm.value].elements[ind] = this.scenedata.compositions[compelm.value].elements[ind+1];
				this.scenedata.compositions[compelm.value].elements[ind+1] = temp;
				compelm.insertBefore(genelm.nextElementSibling,genelm);
				const iconsgen = Array.from(genelm.getElementsByClassName('icon')).concat(Array.from(genelm.previousElementSibling.getElementsByClassName('icon')));
				for(let k=0;k<iconsgen.length;k++){
					const animates = Array.from(iconsgen[k].getElementsByTagName('animateTransform')).concat(Array.from(iconsgen[k].getElementsByTagName('animate')));
					for(let l=0;l<animates.length;l++){
						animates[l].setAttribute('begin', animates[l].getAttribute('begin'));
					}
				}
			};
		});
		const dupbtn = basenode.getElementById('duplicate');
		dupbtn.removeAttribute('id');
		dupbtn.addEventListener('click',()=>{
			const ind = this.scenedata.compositions[compelm.value].elements.indexOf(elm)+1;
			this.scenedata.compositions[compelm.value].elements.splice(ind,0,structuredClone(elm));
			compelm.insertBefore(this.createEffectBase(compelm.value,ind,compelm),genelm.nextElementSibling);
		});
		const movebtn = basenode.getElementById('move');
		movebtn.removeAttribute('id');
		movebtn.addEventListener('click',()=>{
			const cid = parseInt(prompt('Enter the compositition# that you want to move it to (0 is final):'));
			if(!Number.isNaN(cid) && cid < this.scenedata.compositions.length && cid >= 0){
				const ind = this.scenedata.compositions[compelm.value].elements.indexOf(elm);
				this.scenedata.compositions[compelm.value].elements.splice(ind,1);
				this.scenedata.compositions[cid].elements.push(elm);
				//const compconts = this.structure.getElementsByClassName('avee-comp-container');
				for(let i=0;i<this.compelms.length;i++){
					if(this.compelms[i].value == cid){
						this.compelms[i].appendChild(genelm);
						const iconsgen = Array.from(genelm.getElementsByClassName('icon')).concat(Array.from(genelm.previousElementSibling.getElementsByClassName('icon')));
						for(let k=0;k<iconsgen.length;k++){
							const animates = Array.from(iconsgen[k].getElementsByTagName('animateTransform')).concat(Array.from(iconsgen[k].getElementsByTagName('animate')));
							for(let l=0;l<animates.length;l++){
								animates[l].setAttribute('begin', animates[l].getAttribute('begin'));
							}
						}
						compelm = this.compelms[i];
						break;
					}
				}
			}
		});
		const options = Object.getOwnPropertyNames(elm);
		options.splice(options.indexOf('_name'),1);
		options.splice(options.indexOf('v'),1);
		options.splice(options.indexOf('ver'),1);
		options.splice(options.indexOf('objType'),1);
		//parent.console.log(options);
		const cats = [];
		const catos = [];
		const catelms = [];
		const catelmo = [];
		for(let k=0;k<options.length;k++){
			const title = aveesys.p2T(options[k]);
			const ocont = document.createElement('div');
			const osum = document.createElement('h3');
			ocont.className = 'thinContainer';
			osum.innerText = title;
			ocont.appendChild(osum);
			ocont.appendChild(this.parseAveeInput(elm[options[k]],title));
			const indofcat = cats.indexOf(elm[options[k]].tag);
			if(indofcat === -1){
				cats.push(elm[options[k]].tag);
				const ordval = parseInt(elm[options[k]].tag.split('_')[0]);
				catos.push(Number.isNaN(ordval) ? 100 : ordval);
				catelms.push([ocont]);
				catelmo.push([elm[options[k]].o]);
			}else{
				catelms[indofcat].push(ocont);
				catelmo[indofcat].push(elm[options[k]].o);
			}
		}
		const ninds = fsort.quickSort(catos)[1];
		for(let k=0;k<ninds.length;k++){
			if(!cats[ninds[k]]){continue;}
			const catelm = document.createElement('details');
			const catsum = document.createElement('summary');
			catsum.innerText = aveesys.p2T(cats[ninds[k]].split('_')[1] ?? cats[ninds[k]]);
			catelm.appendChild(catsum);
			const nelminds = fsort.quickSort(catelmo[ninds[k]])[1];
			for(let l=0;l<nelminds.length;l++){
				catelm.appendChild(catelms[ninds[k]][nelminds[l]]);
			}
			genelm.appendChild(catelm);
		}
		return genelm;
	}
	createCompBase(i){
		const fullelm = this.comptemplate.content.cloneNode(true);
		const compelm = fullelm.getElementById('details');
		const sumelm = fullelm.getElementById('title');
		sumelm.innerText = i===0 ? 'Final Composition' : 'Composition '+i.toString();
		sumelm.removeAttribute('id');
		compelm.removeAttribute('id');
		//compelm.id = crypto.randomUUID().split('-').join('');
		//compelm.id = 'avee-comp-'+i.toString();
		compelm.value = i;
		this.compelms.push(compelm);
		const delbtn = fullelm.getElementById('delete');
		delbtn.removeAttribute('id');
		delbtn.addEventListener('click',()=>{
			if(confirm('Are you sure you want to delete this composition? (This is irreversable)')){
				const ind = this.compelms.indexOf(compelm);
				this.compelms.splice(ind,1);
				//console.log(ind);
				this.scenedata.compositions.splice(compelm.value,1);
				compelm.remove();
				for(let j=0;j<this.compelms.length;j++){
					if(this.compelms[j].value > compelm.value){
						this.compelms[j].value -= 1;
						this.compelms[j].getElementsByClassName('avee-comp-title')[0].innerText = this.compelms[j].value===0 ? 'Final Composition' : 'Composition '+this.compelms[j].value.toString();
					}
				}
				this.updateStatus(4);
			}
		});
		const upbtn = fullelm.getElementById('upbtn');
		upbtn.removeAttribute('id');
		upbtn.addEventListener('click',()=>{
			if(compelm.value > 0){
				for(let j=0;j<this.compelms.length;j++){
					if(this.compelms[j].value == compelm.value-1){
						this.structure.insertBefore(compelm,this.compelms[j]);
						const temp = this.scenedata.compositions[compelm.value];
						this.scenedata.compositions[compelm.value] = this.scenedata.compositions[compelm.value-1];
						this.scenedata.compositions[compelm.value-1] = temp;
						compelm.value = this.compelms[j].value;
						this.compelms[j].value += 1;
						compelm.getElementsByClassName('avee-comp-title')[0].innerText = compelm.value===0 ? 'Final Composition' : 'Composition '+compelm.value.toString();
						this.compelms[j].getElementsByClassName('avee-comp-title')[0].innerText = 'Composition '+this.compelms[j].value.toString();
						break;
					}
				}
			}
		});
		const downbtn = fullelm.getElementById('downbtn');
		downbtn.removeAttribute('id');
		downbtn.addEventListener('click',()=>{
			if(compelm.value < this.scenedata.compositions.length-1){
				for(let j=0;j<this.compelms.length;j++){
					if(this.compelms[j].value == compelm.value+1){
						this.structure.insertBefore(this.compelms[j],compelm);
						//console.log(this.compelms[j]);
						const temp = this.scenedata.compositions[compelm.value];
						this.scenedata.compositions[compelm.value] = this.scenedata.compositions[compelm.value+1];
						this.scenedata.compositions[compelm.value+1] = temp;
						this.compelms[j].value = compelm.value;
						compelm.value += 1;
						compelm.getElementsByClassName('avee-comp-title')[0].innerText = 'Composition '+compelm.value.toString();
						this.compelms[j].getElementsByClassName('avee-comp-title')[0].innerText = this.compelms[j].value===0 ? 'Final Composition' : 'Composition '+this.compelms[j].value.toString();
						break;
					}
				}
			}
		});
		const imgbtn = fullelm.getElementById('imgbtn');
		imgbtn.removeAttribute('id');
		imgbtn.addEventListener('click',()=>{
			const imgobj = {
				"Color": {
					"hint": "",
					"o": 28,
					"t": "chsla4f",
					"tag": "2_color",
					"v": "1 1 1 1"
				},
				"ColorTo": {
					"hint": "",
					"o": 29,
					"t": "chsla4f",
					"tag": "2_color",
					"v": "1 1 1 1"
				},
				"MaskImage": {
					"o": 36,
					"t": "img internalres:transparent internalres:white internalres:black internalres:particle_circle_blur4 internalres:particle_blur01 internalres:particle_blur_inv internalres:vignette80 composition:0",
					"tag": "1_image",
					"v": ""
				},
				"MeasureColorBlend": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 30,
					"t": "_child",
					"tag": "2_color",
					"v": ""
				},
				"MeasurePos": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"Shape": {
					"o": 35,
					"t": "_child None Circle SidedPolygon",
					"tag": "1_image",
					"v": "None"
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 180
				},
				"_name": "Image",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"autoDetectColorKey": {
					"hint": "",
					"o": 22,
					"t": "b",
					"tag": "2_ColorKey",
					"v": 1
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "Alpha"
				},
				"blurDivider": {
					"hint": "",
					"o": 33,
					"t": "i 0 10",
					"tag": "blur",
					"v": 5
				},
				"blurEnabled": {
					"hint": "",
					"o": 32,
					"t": "b",
					"tag": "blur",
					"v": 0
				},
				"blurRadius": {
					"hint": "",
					"o": 34,
					"t": "i 1 25",
					"tag": "blur",
					"v": 7
				},
				"blurredBorder": {
					"hint": "",
					"o": 27,
					"t": "b",
					"tag": "1_image",
					"v": 1
				},
				"colorKey": {
					"hint": "",
					"o": 23,
					"t": "crgb_hl",
					"tag": "2_ColorKey",
					"v": -16711936
				},
				"colorKeyEnabled": {
					"hint": "",
					"o": 21,
					"t": "b",
					"tag": "2_ColorKey",
					"v": 0
				},
				"customImage": {
					"o": 13,
					"t": "img internalres:white internalres:black internalres:particle_circle_blur4 internalres:vignette80 internalres:rainbow128 internalres:particle_blur01_more internalres:lens_flare internalres:lens_flare_2 composition:0",
					"tag": "1_image",
					"v": ""
				},
				"generatedAlbumArtColor": {
					"hint": "",
					"o": 19,
					"t": "crgba",
					"tag": "generatedAlbumArt",
					"v": -1
				},
				"generatedAlbumArtHint": {
					"hint": "",
					"o": 15,
					"t": "ih 0 7",
					"tag": "generatedAlbumArt",
					"v": 0
				},
				"generatedAlbumArtHintForceGen": {
					"hint": "",
					"o": 18,
					"t": "b",
					"tag": "generatedAlbumArt",
					"v": 0
				},
				"generatedAlbumArtHintNoText": {
					"hint": "",
					"o": 17,
					"t": "b",
					"tag": "generatedAlbumArt",
					"v": 0
				},
				"generatedAlbumArtHintShiftHue": {
					"hint": "",
					"o": 16,
					"t": "b",
					"tag": "generatedAlbumArt",
					"v": 0
				},
				"keepAspectRatio": {
					"hint": "",
					"o": 26,
					"t": "b",
					"tag": "1_image",
					"v": 1
				},
				"keepAspectRatioAndCropToFit": {
					"hint": "",
					"o": 20,
					"t": "b",
					"tag": "1_image",
					"v": 0
				},
				"maskMode": {
					"o": 37,
					"t": "sel Transparency TransparencyAndBlacks TransparencyAndWhites InvertedTransparency",
					"tag": "1_image",
					"v": "Transparency"
				},
				"measureAnimationSpeed": {
					"A": {
						"hint": "Speed",
						"o": 1,
						"t": "f 0 1",
						"tag": "misc",
						"v": 0.5
					},
					"B": {
						"hint": "Beat Amount",
						"o": 2,
						"t": "f 0 1",
						"tag": "misc",
						"v": 0.5
					},
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "TotalTimeAndBeat"
					},
					"o": 14,
					"t": "_child",
					"tag": "1_image",
					"v": ""
				},
				"measureRot": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 12,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"objType": "Image",
				"opacityStrength": {
					"hint": "",
					"o": 25,
					"t": "f 0 4",
					"tag": "2_ColorKey",
					"v": 1
				},
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"rotation": {
					"hint": "",
					"o": 11,
					"t": "f 0 300",
					"tag": "0_general",
					"v": 0
				},
				"saturation": {
					"o": 31,
					"t": "mvarf 0 1",
					"tag": "2_color",
					"v": "Constant 0 1"
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 0
				},
				"transparencyStrength": {
					"hint": "",
					"o": 24,
					"t": "f 0 4",
					"tag": "2_ColorKey",
					"v": 1
				},
				"v": "Image",
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			};
			this.scenedata.compositions[compelm.value].elements.push(imgobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const mirrorbtn = fullelm.getElementById('mirrorbtn');
		mirrorbtn.removeAttribute('id');
		mirrorbtn.addEventListener('click',()=>{
			const mirobj = {
				"MeasurePos": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"TargetImage": {
					"o": 13,
					"t": "img composition:0",
					"tag": "1_appearance",
					"v": ""
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 403
				},
				"_name": "Mirror Effect",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "PreMulAlpha"
				},
				"color": {
					"hint": "",
					"o": 16,
					"t": "crgba",
					"tag": "1_appearance",
					"v": -1
				},
				"flipMirror": {
					"hint": "",
					"o": 15,
					"t": "b",
					"tag": "1_appearance",
					"v": 1
				},
				"measureRot": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 12,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"mirrorMode": {
					"o": 14,
					"t": "sel Horizontal Vertical HorizontalAndVertical",
					"tag": "1_appearance",
					"v": "Horizontal"
				},
				"objType": "MirrorEffect",
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"rotation": {
					"hint": "",
					"o": 11,
					"t": "f 0 300",
					"tag": "0_general",
					"v": 0
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 0
				},
				"v": "MirrorEffect",
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			};
			this.scenedata.compositions[compelm.value].elements.push(mirobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const rgbbtn = fullelm.getElementById('rgbbtn');
		rgbbtn.removeAttribute('id');
		rgbbtn.addEventListener('click',()=>{
			const rgbobj = {
				"MeasurePos": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 359
				},
				"_name": "Rgb Split",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "Alpha"
				},
				"blendModeContent": {
					"o": 13,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "1_appearance",
					"v": "Add"
				},
				"color": {
					"hint": "",
					"o": 14,
					"t": "crgb",
					"tag": "1_appearance",
					"v": -1
				},
				"measureRot": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 12,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"objType": "RgbSplitEffect",
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"rotation": {
					"hint": "",
					"o": 11,
					"t": "f 0 300",
					"tag": "0_general",
					"v": 0
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 0
				},
				"showUnblurredContent": {
					"hint": "",
					"o": 16,
					"t": "b",
					"tag": "1_appearance",
					"v": 1
				},
				"showUnblurredContentUnder": {
					"hint": "",
					"o": 17,
					"t": "b",
					"tag": "1_appearance",
					"v": 0
				},
				"splitAmount": {
					"o": 19,
					"t": "mvarf2 -0.5 0.5",
					"tag": "2_splitEffect",
					"v": "BeatRandomShake 0.5 0.5"
				},
				"splitColor0": {
					"hint": "",
					"o": 20,
					"t": "crgb",
					"tag": "2_splitEffect",
					"v": -65284
				},
				"splitColor1": {
					"hint": "",
					"o": 21,
					"t": "crgb",
					"tag": "2_splitEffect",
					"v": -16777216
				},
				"splitColor2": {
					"hint": "",
					"o": 22,
					"t": "crgb",
					"tag": "2_splitEffect",
					"v": -16711692
				},
				"splitMultiplier": {
					"o": 18,
					"t": "mvarf 0 6",
					"tag": "2_splitEffect",
					"v": "Constant 1.5 6"
				},
				"targetImage": {
					"o": 15,
					"t": "img composition:0",
					"tag": "1_appearance",
					"v": ""
				},
				"v": "RgbSplitEffect",
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			};				
			this.scenedata.compositions[compelm.value].elements.push(rgbobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const audiobtn = fullelm.getElementById('audiobtn');
		audiobtn.removeAttribute('id');
		audiobtn.addEventListener('click',()=>{
			const audobj = {
				"_name": "Audio Provider",
				"audioDurationMs": {
					"hint": "",
					"o": 1,
					"t": "i 20 300",
					"tag": "1_AudioCapture",
					"v": 60
				},
				"beatRangeBarFirst": {
					"hint": "",
					"o": 15,
					"t": "f 0 1",
					"tag": "beat",
					"v": 0
				},
				"beatRangeBarLast": {
					"hint": "",
					"o": 16,
					"t": "f 0 1",
					"tag": "beat",
					"v": 0.2
				},
				"beatRangeValueHigher": {
					"hint": "",
					"o": 18,
					"t": "f 0 100",
					"tag": "beat",
					"v": 35
				},
				"beatRangeValueLower": {
					"hint": "",
					"o": 17,
					"t": "f 0 50",
					"tag": "beat",
					"v": 0.7
				},
				"beatSmooth": {
					"hint": "",
					"o": 14,
					"t": "f 0.1 1",
					"tag": "beat",
					"v": 0.4
				},
				"filterRadius": {
					"hint": "",
					"o": 12,
					"t": "i 0 20",
					"tag": "2_spectrum",
					"v": 1
				},
				"filterStrength": {
					"hint": "",
					"o": 13,
					"t": "f 0.1 2",
					"tag": "2_spectrum",
					"v": 1
				},
				"freqShift": {
					"hint": "",
					"o": 7,
					"t": "f 0 1",
					"tag": "2_spectrumHz",
					"v": 0
				},
				"highQualityAudioCapture": {
					"hint": "",
					"o": 2,
					"t": "b",
					"tag": "1_AudioCapture",
					"v": 0
				},
				"higherHz": {
					"hint": "",
					"o": 5,
					"t": "f 300 18000",
					"tag": "2_spectrumHz",
					"v": 18000
				},
				"hzLinearFactor": {
					"hint": "",
					"o": 6,
					"t": "f 0 1",
					"tag": "2_spectrumHz",
					"v": 0.06
				},
				"lowerFreqMagnitude": {
					"hint": "",
					"o": 19,
					"t": "f 0 1",
					"tag": "2_spectrum",
					"v": 0.25
				},
				"lowerHz": {
					"hint": "",
					"o": 4,
					"t": "f 0 300",
					"tag": "2_spectrumHz",
					"v": 20
				},
				"mirrorSamples": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "2_spectrum",
					"v": 0
				},
				"objType": "AudioProvider",
				"outputMultiplier": {
					"hint": "",
					"o": 20,
					"t": "f 0.1 3",
					"tag": "2_spectrum",
					"v": 1
				},
				"repeatSamples": {
					"hint": "",
					"o": 9,
					"t": "i 1 6",
					"tag": "2_spectrum",
					"v": 1
				},
				"sampleOutCount": {
					"hint": "",
					"o": 3,
					"t": "i 0 512",
					"tag": "2_spectrum",
					"v": 128
				},
				"sampleProvider": {
					"o": 0,
					"t": "_child Waveform Spectrum Spectrum2",
					"tag": "0_general",
					"v": "Spectrum2"
				},
				"smooth": {
					"hint": "",
					"o": 11,
					"t": "f 0.1 1",
					"tag": "2_spectrum",
					"v": 0.8
				},
				"starAndEndGap": {
					"hint": "",
					"o": 10,
					"t": "i 0 30",
					"tag": "2_spectrum",
					"v": 0
				},
				"v": "AudioProvider",
				"ver": "10"
			};
			this.scenedata.compositions[compelm.value].elements.push(audobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const particlebtn = fullelm.getElementById('particlebtn');
		particlebtn.removeAttribute('id');
		particlebtn.addEventListener('click',()=>{
			const partobj = {
				"ColorFrom": {
					"hint": "",
					"o": 25,
					"t": "chsla4f",
					"tag": "appearance",
					"v": "0 0 1 1"
				},
				"ColorTo": {
					"hint": "",
					"o": 26,
					"t": "chsla4f",
					"tag": "appearance",
					"v": "0 0 1 1"
				},
				"CountLimit": {
					"hint": "",
					"o": 13,
					"t": "i 1 5000",
					"tag": "1_overall",
					"v": 1000
				},
				"ForceField": {
					"o": 41,
					"t": "_child None Vortex",
					"tag": "1_overall",
					"v": "None"
				},
				"MeasureOverallSpeed": {
					"A": {
						"hint": "X Amount",
						"o": 1,
						"t": "f 0 2",
						"tag": "misc",
						"v": 1.5
					},
					"B": {
						"hint": "Y Amount",
						"o": 2,
						"t": "f 0 2",
						"tag": "misc",
						"v": 1.5
					},
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Beat"
					},
					"o": 21,
					"t": "_child",
					"tag": "behaviour",
					"v": ""
				},
				"MeasurePos": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"SpawnArea": {
					"o": 20,
					"t": "_child HorizontalLine Rectangle",
					"tag": "1_overall",
					"useRandomVectorInstead": {
						"hint": "",
						"o": 1,
						"t": "b",
						"tag": "misc",
						"v": 0
					},
					"v": "HorizontalLine",
					"vectorAngle": {
						"hint": "",
						"o": 2,
						"t": "f 0 360",
						"tag": "misc",
						"v": 90
					},
					"vectorAngleZ": {
						"hint": "",
						"o": 3,
						"t": "f -1 1",
						"tag": "misc",
						"v": 0.5
					},
					"verticalOrientation": {
						"hint": "",
						"o": 0,
						"t": "b",
						"tag": "misc",
						"v": 0
					}
				},
				"Speed": {
					"hint": "",
					"o": 22,
					"t": "f -300 300",
					"tag": "behaviour",
					"v": 50
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 293
				},
				"_name": "Particles",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "Add"
				},
				"color": {
					"hint": "",
					"o": 12,
					"t": "crgba",
					"tag": "1_overall",
					"v": -1
				},
				"customImage": {
					"o": 11,
					"t": "pimg internalres:particle_blur01 internalres:particle_circle_blur4 internalres:particle_circle_w_a_64 internalres:particle_sharp composition:0",
					"tag": "appearance",
					"v": "internalres:particle_blur01"
				},
				"endSize": {
					"hint": "",
					"o": 34,
					"t": "f 0 20",
					"tag": "appearance",
					"v": 0.5
				},
				"endSizeRandom": {
					"hint": "",
					"o": 35,
					"t": "f 0 20",
					"tag": "appearance",
					"v": 5
				},
				"endSizeZFactor": {
					"hint": "",
					"o": 36,
					"t": "f 0 40",
					"tag": "appearance",
					"v": 0
				},
				"fadeInAndOutTime": {
					"hint": "",
					"o": 28,
					"t": "f 0 0.5",
					"tag": "appearance",
					"v": 0.25
				},
				"fadeInSize": {
					"hint": "",
					"o": 33,
					"t": "f 0 20",
					"tag": "appearance",
					"v": 5
				},
				"gravity": {
					"hint": "",
					"o": 29,
					"t": "f2 -300 300",
					"tag": "behaviour",
					"v": "0 50"
				},
				"lifetime": {
					"hint": "",
					"o": 27,
					"t": "f 0.1 10",
					"tag": "behaviour",
					"v": 1
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"mirrorX": {
					"hint": "",
					"o": 16,
					"t": "b",
					"tag": "1_overall",
					"v": 0
				},
				"mirrorY": {
					"hint": "",
					"o": 17,
					"t": "b",
					"tag": "1_overall",
					"v": 0
				},
				"nearCameraFadeOutDistance": {
					"hint": "",
					"o": 42,
					"t": "f 0 500",
					"tag": "appearance",
					"v": 250
				},
				"objType": "Particles",
				"particleScale": {
					"hint": "",
					"o": 14,
					"t": "f 0.25 8",
					"tag": "appearance",
					"v": 1.99999988
				},
				"perspectiveDepth": {
					"hint": "",
					"o": 18,
					"t": "f 0 1000",
					"tag": "1_overall",
					"v": 0
				},
				"perspectiveFov": {
					"hint": "",
					"o": 19,
					"t": "f 30 180",
					"tag": "1_overall",
					"v": 120
				},
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 0
				},
				"sideSineWaveFreq": {
					"hint": "",
					"o": 37,
					"t": "f 0 10",
					"tag": "waveBehaviour",
					"v": 0
				},
				"sideSineWaveFreqRandom": {
					"hint": "",
					"o": 38,
					"t": "f -10 10",
					"tag": "waveBehaviour",
					"v": 10
				},
				"sideSineWaveMag": {
					"hint": "",
					"o": 39,
					"t": "f 0 10",
					"tag": "waveBehaviour",
					"v": 0
				},
				"sideSineWaveMagRandom": {
					"hint": "",
					"o": 40,
					"t": "f -10 10",
					"tag": "waveBehaviour",
					"v": 1.5
				},
				"sizeAspectRatio": {
					"hint": "",
					"o": 31,
					"t": "f 0.1 10",
					"tag": "appearance",
					"v": 1
				},
				"spawnTime": {
					"hint": "",
					"o": 15,
					"t": "f 0.005 0.05",
					"tag": "behaviour",
					"v": 0.0300000012
				},
				"speedRandom": {
					"hint": "",
					"o": 23,
					"t": "f -300 300",
					"tag": "behaviour",
					"v": 50
				},
				"startSize": {
					"hint": "",
					"o": 32,
					"t": "f 0 20",
					"tag": "appearance",
					"v": 1
				},
				"trailLength": {
					"hint": "",
					"o": 24,
					"t": "f 0 1",
					"tag": "appearance",
					"v": 0.5
				},
				"v": "Particles",
				"velocityAngle": {
					"hint": "",
					"o": 30,
					"t": "b",
					"tag": "appearance",
					"v": 1
				},
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			}
			this.scenedata.compositions[compelm.value].elements.push(partobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const textbtn = fullelm.getElementById('textbtn');
		textbtn.removeAttribute('id');
		textbtn.addEventListener('click',()=>{
			const txtobj = {
				"MeasurePos": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 173
				},
				"_name": "Text",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0 0"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "PreMulAlpha"
				},
				"color": {
					"hint": "",
					"o": 14,
					"t": "crgba",
					"tag": "appearance",
					"v": -1
				},
				"fontSize": {
					"hint": "",
					"o": 15,
					"t": "i 8 100",
					"tag": "appearance",
					"v": 27
				},
				"measureRot": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 12,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"objType": "Text",
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"rotation": {
					"hint": "",
					"o": 11,
					"t": "f 0 300",
					"tag": "0_general",
					"v": 0
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 1
				},
				"text": {
					"o": 13,
					"t": "ptxt",
					"tag": "appearance",
					"v": "{ArtistOrTitle}"
				},
				"typeFace": {
					"o": 16,
					"t": "passet",
					"tag": "appearance",
					"v": "internal_2"
				},
				"v": "Text",
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			};
			this.scenedata.compositions[compelm.value].elements.push(txtobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const motionblurbtn = fullelm.getElementById('motionblurbtn');
		motionblurbtn.removeAttribute('id');
		motionblurbtn.addEventListener('click',()=>{
			const mtnobj = {
				"MeasurePos": {
					"A": {
						"hint": "Amount",
						"o": 1,
						"t": "f 0 2",
						"tag": "misc",
						"v": 0.5
					},
					"B": {
						"hint": "Speed",
						"o": 2,
						"t": "f 0 2",
						"tag": "misc",
						"v": 0.5
					},
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "BeatCamShakeMore"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"TargetImage": {
					"o": 15,
					"t": "img composition:0",
					"tag": "1_appearance",
					"v": ""
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 353
				},
				"_name": "Motion Blur Effect",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "Alpha"
				},
				"blendModeContent": {
					"o": 13,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "1_appearance",
					"v": "Add"
				},
				"blurAmountMultiplier": {
					"o": 18,
					"t": "mvarf 0 2",
					"tag": "2_motionBlur",
					"v": "Constant 1 1"
				},
				"color": {
					"hint": "",
					"o": 14,
					"t": "crgb",
					"tag": "1_appearance",
					"v": -1
				},
				"measureRot": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 12,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"motionSource": {
					"o": 19,
					"t": "_child EffectTransform Manual",
					"tag": "2_motionBlur",
					"v": "EffectTransform"
				},
				"objType": "MotionBlurEffect",
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"relativeMotionMode": {
					"hint": "",
					"o": 20,
					"t": "b",
					"tag": "2_motionBlur",
					"v": 1
				},
				"rotation": {
					"hint": "",
					"o": 11,
					"t": "f 0 300",
					"tag": "0_general",
					"v": 0
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 0
				},
				"showUnblurredContent": {
					"hint": "",
					"o": 16,
					"t": "b",
					"tag": "1_appearance",
					"v": 0
				},
				"showUnblurredContentUnder": {
					"hint": "",
					"o": 17,
					"t": "b",
					"tag": "1_appearance",
					"v": 0
				},
				"v": "MotionBlurEffect",
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			};
			this.scenedata.compositions[compelm.value].elements.push(mtnobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const blurbtn = fullelm.getElementById('blurbtn');
		blurbtn.removeAttribute('id');
		blurbtn.addEventListener('click',()=>{
			const blurobj = {
				"1layerColor": {
					"hint": "",
					"o": 24,
					"t": "crgba",
					"tag": "2_blur",
					"v": -1
				},
				"1layerScale": {
					"hint": "",
					"o": 21,
					"t": "f2 0 10",
					"tag": "2_blur",
					"v": "1 1"
				},
				"2layerColor": {
					"hint": "",
					"o": 25,
					"t": "crgba",
					"tag": "2_blur",
					"v": -10855846
				},
				"2layerScale": {
					"hint": "",
					"o": 22,
					"t": "f2 0 10",
					"tag": "2_blur",
					"v": "1.25 1.25"
				},
				"3layerColor": {
					"hint": "",
					"o": 26,
					"t": "crgba",
					"tag": "2_blur",
					"v": -10592674
				},
				"3layerScale": {
					"hint": "",
					"o": 23,
					"t": "f2 0 10",
					"tag": "2_blur",
					"v": "0.75 0.75"
				},
				"MaskImage": {
					"o": 16,
					"t": "img internalres:transparent internalres:white internalres:black internalres:particle_circle_blur4 internalres:particle_blur01 internalres:particle_blur_inv internalres:vignette80 composition:0",
					"tag": "1_appearance",
					"v": "internalres:transparent"
				},
				"MeasurePos": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 195
				},
				"_name": "Blur Effect",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "Alpha"
				},
				"blendModeContent": {
					"o": 13,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "1_appearance",
					"v": "Add"
				},
				"blurMultiplier": {
					"hint": "",
					"o": 18,
					"t": "f 1 6",
					"tag": "2_blur",
					"v": 3.75
				},
				"blurRadius": {
					"hint": "",
					"o": 17,
					"t": "f 0 3",
					"tag": "2_blur",
					"v": 2.025
				},
				"color": {
					"hint": "",
					"o": 14,
					"t": "crgba",
					"tag": "1_appearance",
					"v": -16777216
				},
				"measureRot": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 12,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"objType": "BlurEffect",
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"rotation": {
					"hint": "",
					"o": 11,
					"t": "f 0 300",
					"tag": "0_general",
					"v": 0
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 0
				},
				"showUnblurredContent": {
					"hint": "",
					"o": 19,
					"t": "b",
					"tag": "1_appearance",
					"v": 1
				},
				"showUnblurredContentUnder": {
					"hint": "",
					"o": 20,
					"t": "b",
					"tag": "1_appearance",
					"v": 0
				},
				"sourceCompositionIndex": {
					"hint": "",
					"o": 15,
					"t": "i 1 5",
					"tag": "1_appearance",
					"v": 1
				},
				"v": "BlurEffect",
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			};
			this.scenedata.compositions[compelm.value].elements.push(blurobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const barbtn = fullelm.getElementById('barbtn');
		barbtn.removeAttribute('id');
		barbtn.addEventListener('click',()=>{
			const barobj = {
				"MeasurePos": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing BeatCamShakeMore BeatCamShakeLess BeatRandomShake ConstantShakeMore ConstantShake TrackPosition",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 6,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"Segment1": {
					"barHeightMultiplier": {
						"hint": "",
						"o": 3,
						"t": "f -2 2",
						"tag": "misc",
						"v": 1
					},
					"barWidth": {
						"hint": "",
						"o": 4,
						"t": "f 0 2",
						"tag": "misc",
						"v": 0.5
					},
					"barWidthAffectedByShape": {
						"hint": "",
						"o": 5,
						"t": "b",
						"tag": "b",
						"v": 0
					},
					"colorFrom": {
						"hint": "",
						"o": 0,
						"t": "crgba",
						"tag": "misc",
						"v": -1
					},
					"colorTo": {
						"hint": "",
						"o": 1,
						"t": "crgba",
						"tag": "misc",
						"v": -1
					},
					"fixedHeight": {
						"hint": "",
						"o": 2,
						"t": "f -50 50",
						"tag": "misc",
						"v": 0
					},
					"mirror": {
						"hint": "",
						"o": 6,
						"t": "b",
						"tag": "b",
						"v": 0
					},
					"o": 23,
					"t": "_child None Bars Line SharpBars RoundBars",
					"tag": "1_bars",
					"v": "Bars"
				},
				"Segment2": {
					"o": 24,
					"t": "_child None Bars Line SharpBars RoundBars",
					"tag": "1_bars",
					"v": "None"
				},
				"ShapePath": {
					"o": 17,
					"t": "_child HorizontalLine Circle SidedPolygon Letter",
					"tag": "1_bars",
					"v": "HorizontalLine"
				},
				"_id": {
					"hint": "",
					"o": 0,
					"t": "ih",
					"tag": "",
					"v": 297
				},
				"_name": "Bars/Segments",
				"alignmentPosition": {
					"hint": "",
					"o": 7,
					"t": "f2 0 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"anchorX": {
					"o": 4,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"anchorY": {
					"o": 5,
					"t": "sel unset start center end",
					"tag": "0_general",
					"v": "unset"
				},
				"audioProviderIndex": {
					"hint": "",
					"o": 22,
					"t": "i 1 4",
					"tag": "2_Behavior",
					"v": 1
				},
				"blendMode": {
					"o": 2,
					"t": "_child Alpha PreMulAlpha Screen Add AddAlpha",
					"tag": "0_general",
					"v": "Alpha"
				},
				"colorBlendOffset": {
					"o": 18,
					"t": "mvarf 0 1",
					"tag": "1_bars",
					"v": "Constant 0 0"
				},
				"flipInput": {
					"hint": "",
					"o": 13,
					"t": "b",
					"tag": "1_bars",
					"v": 0
				},
				"heightScale": {
					"hint": "",
					"o": 14,
					"t": "f -10 10",
					"tag": "1_bars",
					"v": 1
				},
				"maxHeightScale": {
					"hint": "",
					"o": 16,
					"t": "f 0.1 1",
					"tag": "1_bars",
					"v": 1
				},
				"measureRot": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 12,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"measureScale": {
					"measureWhat": {
						"o": 0,
						"t": "_child Nothing Beat TotalTime TotalTimeBackward TotalTimeWhenPlaying TotalTimeAndBeat TrackPosition BeatRandomShake BeatCamShakeRotMore BeatCamShakeRotLess ConstantShakeRotMore ConstantShakeRotLess BeatTriggerAnim",
						"tag": "misc",
						"v": "Nothing"
					},
					"o": 10,
					"t": "_child",
					"tag": "0_general",
					"v": ""
				},
				"minHeightScale": {
					"hint": "",
					"o": 15,
					"t": "f -0.03 0.03",
					"tag": "1_bars",
					"v": 0
				},
				"objType": "Bars",
				"position": {
					"hint": "",
					"o": 3,
					"t": "f2 -1 1",
					"tag": "0_general",
					"v": "0.5 0.5"
				},
				"reactionAccumulatedDelay": {
					"hint": "",
					"o": 21,
					"t": "i 0 9",
					"tag": "2_Behavior",
					"v": 0
				},
				"reactionDelay": {
					"hint": "",
					"o": 20,
					"t": "i 0 9",
					"tag": "2_Behavior",
					"v": 0
				},
				"rotation": {
					"hint": "",
					"o": 11,
					"t": "f 0 300",
					"tag": "0_general",
					"v": 0
				},
				"scale": {
					"hint": "",
					"o": 9,
					"t": "f2 0 2",
					"tag": "0_general",
					"v": "1 1"
				},
				"scaleIsUniform": {
					"hint": "",
					"o": 8,
					"t": "b",
					"tag": "0_general",
					"v": 0
				},
				"softness": {
					"hint": "",
					"o": 19,
					"t": "i 0 20",
					"tag": "2_Behavior",
					"v": 2
				},
				"v": "Bars",
				"ver": "10",
				"visible": {
					"hint": "",
					"o": 1,
					"t": "b",
					"tag": "0_general",
					"v": 1
				}
			};
			this.scenedata.compositions[compelm.value].elements.push(barobj);
			compelm.appendChild(this.createEffectBase(compelm.value,this.scenedata.compositions[compelm.value].elements.length-1,compelm));
		});
		const options = Object.getOwnPropertyNames(this.scenedata.compositions[i]);
		options.splice(options.indexOf('_name'),1);
		options.splice(options.indexOf('elements'),1);
		options.splice(options.indexOf('v'),1);
		options.splice(options.indexOf('ver'),1);
		options.splice(options.indexOf('objType'),1);
		const cats = [];
		const catos = [];
		const catelms = [];
		const catelmo = [];
		//const optionelms = new Array(options.length);
		for(let j=0;j<options.length;j++){
			const title = aveesys.p2T(options[j]);
			const ocont = document.createElement('div');
			const osum = document.createElement('h3');
			ocont.className = 'thinContainer';
			osum.innerText = title;
			ocont.appendChild(osum);
			ocont.appendChild(this.parseAveeInput(this.scenedata.compositions[i][options[j]],title));
			/*
			,this.scenedata.compositions[i][options[j]].t,this.scenedata.compositions[i][options[j]].v,title,inp=>{
				//alert(inp);
				this.scenedata.compositions[i][options[j]].v = inp;
			}
			*/
			//optionelms[this.scenedata.compositions[i][options[j]].o] = ocont;
			const indofcat = cats.indexOf(this.scenedata.compositions[i][options[j]].tag);
			if(indofcat === -1){
				const controlTag = this.scenedata.compositions[i][options[j]].tag;
				cats.push(controlTag);
				catos.push(parseInt(controlTag.split('_')[0]));
				catelms.push([ocont]);
				catelmo.push([this.scenedata.compositions[i][options[j]].o]);
			}else{
				catelms[indofcat].push(ocont);
				catelmo[indofcat].push(this.scenedata.compositions[i][options[j]].o);
			}
		}
		//There's so many ways of sorting the categories and so many edge cases that can happen... Gosh, I hate this format
		const controlselm = document.createElement('details');
		controlselm.className = 'avee-elm-controls';
		const controlssum = document.createElement('summary');
		controlssum.innerText = 'Controls';
		controlselm.appendChild(controlssum);
		controlselm.className = 'avee-elm-controls';
		const ninds = fsort.quickSort(catos)[1];
		for(let j=0;j<ninds.length;j++){
			const catelm = document.createElement('details');
			const catsum = document.createElement('summary');
			const tagParts = cats[ninds[j]].split('_');
			if(tagParts.length < 2){
				catsum.innerText = aveesys.p2T(cats[ninds[j]]);
			}else{
				catsum.innerText = aveesys.p2T(tagParts[1]);
			}
			catelm.appendChild(catsum);
			const nelminds = fsort.quickSort(catelmo[ninds[j]])[1];
			for(let k=0;k<nelminds.length;k++){
				catelm.appendChild(catelms[ninds[j]][nelminds[k]]);
			}
			controlselm.appendChild(catelm);
		}
		compelm.appendChild(controlselm);
		return compelm;
	}
	static chsla4f2rgb(h, s, l) {
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs((h * 6) % 2 - 1));
		const m = l - c / 2;
		let r, g, b;

		if (h < (1/6)) { r = c; g = x; b = 0; }
		else if (h < (1/3)) { r = x; g = c; b = 0; }
		else if (h < 0.5) { r = 0; g = c; b = x; }
		else if (h < (2/3)) { r = 0; g = x; b = c; }
		else if (h < (5/6)) { r = x; g = 0; b = c; }
		else { r = c; g = 0; b = x; }

		return new Uint8Array([Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]);
	}
	static rgb2chsla4f(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		
		const sorted = fsort.tsort(new Float32Array([r,g,b]));
		
		let h, s, l = (sorted[0][2] + sorted[0][0]) / 2;
		
		switch(sorted[0][2]){
		case sorted[0][0]:
			h = s = 0;
			break;
		default:
			const d = sorted[0][2] - sorted[0][0];
			s = l > 0.5 ? d / (2 - sorted[0][2] - sorted[0][0]) : d / (sorted[0][2] + sorted[0][0]);
			
			switch(sorted[1][2]){
			case 0:
				h = ((g - b) / d + (g < b ? 6 : 0))/6;
				break;
			case 1:
				h = ((b - r) / d + 2)/6;
				break;
			case 2:
				h = ((r - g) / d + 4)/6;
				break;
			}
		}

		return new Float32Array([h, s, l]);
	}
	updateStatus(mode=0){
		this.status.innerText = "VERSION: "+this.scenedata.ver+" / COMPOSITIONS: "+this.scenedata.compositions.length.toString()+" / TEMPLATE: "+this.scenedata.template.toString()+" / IMAGES: "+this.images.length;
		switch(mode){
		case 0:
		case 1:
		case 3:
			const tempfilecont = document.createElement('div');
			for(let i=0;i<this.images.length;i++){
				const entry = this.entrytemplate.content.cloneNode(true);
				parent.console.log(entry);
				const nameelm = entry.getElementById('name');
				nameelm.removeAttribute('id');
				nameelm.value = this.images[i][0];
				nameelm.addEventListener('change',()=>{this.images[i][0] = nameelm.value;this.updateStatus(2);});
				const url = URL.createObjectURL(this.images[i][1]);
				const imgelm = entry.getElementById('img');
				imgelm.removeAttribute('id');
				imgelm.src = url;
				imgelm.onload = ()=>URL.revokeObjectURL(url);
				imgelm.addEventListener('click',e=>{
					e.target.classList.toggle('expanded');
					if(e.target.classList.contains('expanded')){
						document.body.style.overflow = 'hidden';
					}else{
						document.body.style.overflow = '';
					}
				});
				const delbtn = entry.getElementById('delete');
				delbtn.removeAttribute('id');
				delbtn.addEventListener('click',()=>{if(confirm('Are you sure you want to delete this image?')){this.images.splice(i,1);this.updateStatus(3);}})
				const downloadbtn = entry.getElementById('download');
				downloadbtn.removeAttribute('id');
				downloadbtn.addEventListener('click',()=>{
					const anchor = document.createElement('a');
					anchor.download = this.images[i][0];
					anchor.href = URL.createObjectURL(this.images[i][1]);
					anchor.click();
					anchor.remove();
					URL.revokeObjectURL(anchor.href);
				});
				tempfilecont.appendChild(entry);
			}
			this.filecont.parentElement.insertBefore(tempfilecont,this.filecont);
			tempfilecont.id = this.filecont.id;
			tempfilecont.className = this.filecont.className;
			this.filecont.remove();
			this.filecont = tempfilecont;
		}
		switch(mode){
		case 0:
			this.compelms.length = 0;
			const tempstruct = document.createElement('div');
			for(let i=0;i<this.scenedata.compositions.length;i++){
				const compelm = this.createCompBase(i);
				for(let j=0;j<this.scenedata.compositions[i].elements.length;j++){
					compelm.appendChild(this.createEffectBase(i,j,compelm));
				}
				tempstruct.appendChild(compelm);
			}
			this.structure.parentElement.insertBefore(tempstruct,this.structure);
			tempstruct.id = this.structure.id;
			tempstruct.className = this.structure.className;
			this.structure.remove();
			this.structure = tempstruct;
			break;
		case 1:
		case 2:
		case 3:{
			const structimg = Array.from(document.getElementsByClassName('avee-struct-img')).concat(Array.from(document.getElementsByClassName('avee-struct-pimg')));
			for(let i=0;i<structimg.length;i++){
				const tempv = structimg[i].value;
				const structimgo = structimg[i].getElementsByTagName('option');
				for(let j=structimgo.length-1;j>=0;--j){
					if(structimgo[j].value.startsWith('local:')){structimgo[j].remove();}
				}
				for(let j=0;j<this.images.length;j++){
					const imgselo = document.createElement('option');
					imgselo.value = imgselo.innerText = 'local:'+this.images[j][0];
					structimg[i].appendChild(imgselo);
				}
				structimg[i].value = tempv;
			}
			break;
		}
		case 4:{
			const structimg = Array.from(document.getElementsByClassName('avee-struct-img')).concat(Array.from(document.getElementsByClassName('avee-struct-pimg')));
			for(let i=0;i<structimg.length;i++){
				const tempv = structimg[i].value;
				const structimgo = structimg[i].getElementsByTagName('option');
				for(let j=structimgo.length-1;j>=0;--j){
					if(structimgo[j].value.startsWith('composition:')){structimgo[j].remove();}
				}
				for(let j=0;j<this.scenedata.compositions.length;j++){
					const imgselo = document.createElement('option');
					imgselo.value = imgselo.innerText = 'composition:'+j.toString();
					structimg[i].appendChild(imgselo);
				}
				structimg[i].value = tempv;
			}
			break;
		}
		}
	}
	async saveFile(){
		if(!this.scenedata){
			alert('No file loaded!');
			return;
		}
		parent.console.log(this.scenedata);
		const zw = new zip.ZipWriter(new zip.BlobWriter("application/zip"), { bufferedWrite: true });
		const anchor = document.createElement('a');
		const prog = document.createElement('progress');
		this.controls.appendChild(prog);
		await zw.add('scene.json',new zip.TextReader(JSON.stringify(this.scenedata)),{onstart(m){prog.max = m},onprogress(v,m){prog.value = v;prog.max = m;}});
		for(let i=0;i<this.images.length;i++){
			await zw.add(this.images[i][0],new zip.BlobReader(this.images[i][1]));
		}
		prog.remove();
		anchor.download = this.filenameinp.value ?? 'AveeEditorExport.viz';
		anchor.href = URL.createObjectURL(await zw.close());
		//document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(anchor.href);
	}
	static p2T(s,h=''){
		//s[0] = s[0].toUpperCase(); worked in the console...
		s = s[0].toUpperCase() + s.substr(1);
		let arr = [];
		let origin = 0;
		for(let i=1;i<s.length;i++){
			if(s[i] === s[i].toUpperCase()){
				arr.push(s.substring(origin,i));
				origin = i;
			}
		}
		arr.push(s.substring(origin,s.length));
		return arr.join(' ') + (h ? " ("+h+")" : h);
	}
	parseAveeInput(obj,title){ //,inputstr,v,title,cbk
		const splitted = obj.t.split(' ');
		const cmd = splitted.splice(0,1)[0];
		switch(cmd){
			case '_child':{
				const outelm = document.createElement('div');
				outelm.className = 'avee-struct-'+cmd;
				if(splitted.length > 0){
					const sel = document.createElement('select');
					for(let i=0;i<splitted.length;i++){
						const optionelm = document.createElement('option');
						optionelm.value = splitted[i];
						optionelm.innerText = splitted[i];
						sel.appendChild(optionelm);
					}
					sel.value = obj.v;
					sel.addEventListener('change',()=>{obj.v = sel.value});
					outelm.appendChild(sel);
				}
				const children = Object.getOwnPropertyNames(obj);
				children.splice(children.indexOf('o'),1);
				children.splice(children.indexOf('t'),1);
				children.splice(children.indexOf('tag'),1);
				children.splice(children.indexOf('v'),1);
				const childelms = new Array(children.length);
				for(let i=0;i<children.length;i++){
					const ctitle = aveesys.p2T(children[i]);
					const ocont = document.createElement('div');
					const osum = document.createElement('h3');
					ocont.className = 'thinContainer';
					osum.innerText = ctitle;
					ocont.appendChild(osum);
					ocont.appendChild(this.parseAveeInput(obj[children[i]],ctitle));
					childelms[obj[children[i]].o] = ocont;
				}
				for(let i=0;i<childelms.length;i++){
					outelm.appendChild(childelms[i]);
				}
				return outelm;
				break;
			}
			case 'img':
			case 'pimg':
				splitted.push('');
				for(let i=0;i<this.scenedata.compositions.length;i++){
					const compstr = "composition:"+i.toString();
					(splitted.indexOf(compstr) === -1) && (splitted.push(compstr));
				}
				for(let i=0;i<this.images.length;i++){
					splitted.push('local:'+this.images[i][0]);
				}
			case 'sel':{
				const outelm = document.createElement('select');
				for(let i=0;i<splitted.length;i++){
					const optionelm = document.createElement('option');
					optionelm.innerText = optionelm.value = splitted[i];
					outelm.appendChild(optionelm);
				}
				outelm.value = obj.v;
				outelm.className = 'avee-struct-'+cmd;
				outelm.addEventListener('change',()=>{obj.v = outelm.value});
				return outelm;
				break;
			}
			case 'crgba':{
				const outelm = document.createElement('div');
				outelm.className = 'avee-struct-'+cmd;
				const clrinp = document.createElement('input');
				const ainp = document.createElement('input');
				const clr = (obj.v >>> 0).toString("16").padStart(8,"0");
				clrinp.type = 'color';
				clrinp.value = "#"+clr.substr(2);
				ainp.type = 'range'
				ainp.min = 0;
				ainp.max = 255;
				ainp.value = parseInt(clr.substr(0,2),16);
				outelm.appendChild(clrinp);
				outelm.appendChild(ainp);
				const updobj = ()=>{obj.v = parseInt(ainp.value.toString(16)+clrinp.value.substr(1),16) | 0;};
				clrinp.addEventListener('change',updobj);
				ainp.addEventListener('change',updobj);
				return outelm;
				break;
			}
			case 'crgb_hl':
			case 'crgb':{
				const clrinp = document.createElement('input');
				clrinp.className = 'avee-struct-'+cmd;
				const clr = (obj.v & 0xFFFFFF).toString("16").padStart(6,"0");
				clrinp.type = 'color';
				clrinp.value = "#"+clr;
				clrinp.addEventListener('change',()=>{obj.v = (4278190080 + parseInt(clrinp.value.substr(1),16)) | 0;});
				return clrinp;
				break;
			}
			case 'f':{
				const outelm = document.createElement('div');
				outelm.className = 'avee-struct-'+cmd;
				const rinp = document.createElement('input');
				rinp.type = 'range';
				rinp.min = splitted[0];
				rinp.max = splitted[1];
				rinp.value = obj.v;
				rinp.step = (rinp.max-rinp.min)/40;
				const ninp = rinp.cloneNode();
				ninp.type = 'number';
				outelm.appendChild(rinp);
				outelm.appendChild(ninp);
				const commit = ()=>{
					//alert(rinp.value);
					obj.v = parseFloat(rinp.value);
				};
				rinp.addEventListener('change',commit);
				ninp.addEventListener('change',commit);
				rinp.addEventListener('input',()=>{
					ninp.value = rinp.value;
				});
				ninp.addEventListener('input',()=>{
					rinp.value = ninp.value;
				});
				return outelm;
				break;
			}
			case 'ih':
			case 'i':{
				const outelm = document.createElement('div');
				outelm.className = 'avee-struct-'+cmd;
				const rinp = document.createElement('input');
				rinp.type = 'range';
				rinp.min = splitted[0];
				rinp.max = splitted[1];
				rinp.value = obj.v;
				const ninp = rinp.cloneNode();
				ninp.type = 'number';
				outelm.appendChild(rinp);
				outelm.appendChild(ninp);
				const commit = ()=>{
					obj.v = parseInt(rinp.value);
				};
				rinp.addEventListener('change',commit);
				ninp.addEventListener('change',commit);
				rinp.addEventListener('input',()=>{
					ninp.value = rinp.value;
				});
				ninp.addEventListener('input',()=>{
					rinp.value = ninp.value;
				});
				return outelm;
				break;
			}
			case 'pb':
			case 'b':{
				const outelm = document.createElement("div");
				outelm.className = 'avee-struct-'+cmd;
				outelm.className = 'slidercontainer';
				const switchcont = document.createElement("label");
				switchcont.className = 'switch';
				const switcher = document.createElement("input");
				switcher.type = 'checkbox';
				switcher.id = "aveechkb."+crypto.randomUUID();
				const slider = document.createElement("span");
				slider.className = 'slider round';
				switchcont.appendChild(switcher);
				switchcont.appendChild(slider);
				outelm.appendChild(switchcont);
				const divider = document.createElement("vl");
				divider.className =  'vl';
				outelm.appendChild(divider);
				const label = document.createElement('label');
				label.setAttribute('for',switcher.id);
				label.className = 'sliderlabel';
				label.innerText = title;
				outelm.appendChild(label);
				switcher.addEventListener('change',()=>{
					//alert(switcher.checked);
					obj.v = switcher.checked;
				});
				switcher.checked = obj.v;
				return outelm;
			}
			case "f2":{
				const outelm = document.createElement('div');
				outelm.className = 'avee-struct-'+cmd;
				const vals = obj.v.split(' ');
				const rangeContainer1 = document.createElement('div');
				const rangeContainer2 = document.createElement('div');
				rangeContainer1.className = rangeContainer2.className = 'aveeComponentRange';
				const rinp1 = document.createElement('input');
				rinp1.type = 'range';
				rinp1.min = splitted[0];
				rinp1.max = splitted[1];
				rinp1.value = vals[0];
				rinp1.step = (rinp1.max-rinp1.min)/40;
				const ninp1 = rinp1.cloneNode();
				ninp1.type = 'number';
				const rinp2 = rinp1.cloneNode();
				rinp2.value = vals[1];
				const ninp2 = ninp1.cloneNode();
				ninp2.value = vals[1];
				rangeContainer1.appendChild(rinp1);
				rangeContainer1.appendChild(ninp1);
				outelm.appendChild(rangeContainer1);
				rangeContainer2.appendChild(rinp2);
				rangeContainer2.appendChild(ninp2);
				outelm.appendChild(rangeContainer2);
				const commit = ()=>{
					//alert(rinp1.value+' '+rinp2.value);
					obj.v = rinp1.value+' '+rinp2.value;
				};
				rinp1.addEventListener('change',commit);
				ninp1.addEventListener('change',commit);
				rinp2.addEventListener('change',commit);
				ninp2.addEventListener('change',commit);
				rinp1.addEventListener('input',()=>{
					ninp1.value = rinp1.value;
				});
				ninp1.addEventListener('input',()=>{
					rinp1.value = ninp1.value;
				});
				rinp2.addEventListener('input',()=>{
					ninp2.value = rinp2.value;
				});
				ninp2.addEventListener('input',()=>{
					rinp2.value = ninp2.value;
				});
				return outelm;
			}
			case 'passet':
			case 'ptxt':{
				const outelm = document.createElement("input");
				outelm.className = 'avee-struct-'+cmd;
				outelm.type = 'text';
				outelm.placeholder = title;
				outelm.value = obj.v;
				outelm.addEventListener('change',()=>{obj.v = outelm.value});
				return outelm;
				break;
			}
			case 'mvarf':{
				//TODO
				//Found in Bars/Segments
				const outelm = document.createElement("span");
				outelm.innerText = "Sorry, we don't currently support this parameter ("+cmd+")";
				return outelm;
				break;
			}
			case 'mvarf2':{
				//okay, this definately needs a template
				const outelm = document.createElement("span");
				/*
				const vsplit = obj.v.split(';');
				for(let i=0;i<vsplit.length;i++){
					
				}
				*/
				outelm.innerText = "Sorry, we don't currently support this parameter ("+cmd+")";
				return outelm;
				break;
			}
			case 'chsla4f':{
				const outelm = document.createElement('div');
				outelm.className = 'avee-struct-'+cmd;
				const clrinp = document.createElement('input');
				const ainp = document.createElement('input');
				clrinp.type = 'color';
				let clr = "#";
				const vsplit = obj.v.split(' ');
				//parent.console.log(vsplit);
				const rgbcomp = aveesys.chsla4f2rgb(...(vsplit.splice(0,3).map(v=>parseFloat(v))));
				for(let i=0;i<rgbcomp.length;i++){clr += rgbcomp[i].toString(16).padStart(2,'0');}
				clrinp.value = clr;
				//parent.console.log(rgbcomp);
				//parent.console.log(clr);
				ainp.type = 'range'
				ainp.min = 0;
				ainp.max = 1;
				ainp.value = vsplit[0];
				ainp.step = 1/300;
				outelm.appendChild(clrinp);
				outelm.appendChild(ainp);
				const updobj = ()=>{
					obj.v = '';
					const chsla4fvals = aveesys.rgb2chsla4f(parseInt(clrinp.value.substr(1,2),16),parseInt(clrinp.value.substr(3,2),16),parseInt(clrinp.value.substr(5,2),16));
					for(let i=0;i<chsla4fvals.length;i++){
						obj.v += chsla4fvals[i].toString() + ' ';
					};
					obj.v += ainp.value;
					//alert(obj.v);
				};
				clrinp.addEventListener('change',updobj);
				ainp.addEventListener('change',updobj);
				return outelm;
				break;
			}
			case 'asset':{
				const outelm = document.createElement('select');
				for(let i=0;i<splitted.length;i++){
					const optionelm = document.createElement('option');
					optionelm.innerText = optionelm.value = splitted[i].split(':')[0];
					outelm.appendChild(optionelm);
				}
				outelm.value = obj.v;
				outelm.className = 'avee-struct-'+cmd;
				outelm.addEventListener('change',()=>{obj.v = outelm.value});
				return outelm;
				break;
			}
			default:{
				const outelm = document.createElement("span");
				outelm.innerText = "Sorry, we don't currently support this parameter ("+cmd+")";
				return outelm;
				break;
			}
		}
	}
}
const sys = new aveesys(
	document.getElementById('avee-viz-input'),
	document.getElementById('avee-status'),
	document.getElementById('avee-structure'),
	document.getElementById('avee-export'),
	document.getElementById('avee-filename'),
	document.getElementById('avee-controls'),
	document.getElementById('avee-files'),
	document.getElementById('avee-file-template'),
	document.getElementById('avee-img-input'),
	document.getElementById('avee-addcomp-btn'),
	document.getElementById('avee-comp-template'),
	document.getElementById('avee-effect-template')
);
