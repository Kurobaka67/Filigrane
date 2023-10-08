<script lang="ts">
import { defineComponent, ref, type ObjectHTMLAttributes } from 'vue'
import { degrees, PDFDocument, rgb, StandardFonts, type Color, PDFFont } from 'pdf-lib';
import {Base64} from 'js-base64';
async function bufferToBase64(buffer : any) {
  // use a FileReader to generate a base64 data URI:
  const base64url = await new Promise(r => {
    const reader = new FileReader()
    reader.onload = () => r(reader.result)
    reader.readAsDataURL(new Blob([buffer], { type: "application/pdf" }))
  });
  // remove the `data:...;base64,` part from the start
  return base64url;
}
export default defineComponent({
    name:'SecurePDF',
    data() {
        return {
            file: null as File | null,
            base64: "" as string | null | undefined,
            arrayBuffer: null as ArrayBuffer | null,
            pdfBytes: null as Uint8Array | null,
            sizeFont: 50 as number,
            text: 'This text was added with JavaScript!' as string,
            colorFont: {rgba: {a: 1, b: 0, r: 255, g: 0,}, hex8: '#FF0000FF'},
            recurrenceLine: 1 as number,
            numberLine: 6 as number,
            degree: "-45" as string,
            pdfWidth: 0 as number,
            pdfHeight: 0 as number,
            optionsDisplay: 'none' as string,
            animationArrow: '' as string,
            displayColorPanel: 'none' as string
        }
    },
    methods: {
        onFileChanged($event: Event) {
            const target = $event.target as HTMLInputElement;
            if (target && target.files) {
                this.file = target.files[0];
                // FileReader function for read the file.
                var fileReader = new FileReader();
                // Onload of file read the file content
                fileReader.onload = (fileLoadedEvent) => {
                    this.base64 = fileLoadedEvent.target?.result as string;
                    this.arrayBuffer = this.dataURItoBlob(this.base64)
                    this.modifyPdf()
                };
                // Convert data to base64
                fileReader.readAsDataURL(this.file);
                
            }
        },
        dataURItoBlob(dataURI: string) : ArrayBuffer {
            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);

            // create a view into the buffer
            var ia = new Uint8Array(ab);

            // set the bytes of the buffer to the correct values
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return ab;

        },
        download_pdf(){
            if(this.pdfBytes){
                var blob=new Blob([this.pdfBytes as Uint8Array], {type: "application/pdf"});// change resultByte to bytes

                var link=document.createElement('a');
                link.href=window.URL.createObjectURL(blob);
                link.download="myFileName.pdf";
                link.click();
            }
        },
        get_file_base64(){
            return this.base64==null?undefined:this.base64;
        },
        get_string_pixel_length(str: string, font: PDFFont, size: number){
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            ctx.font = size + "px " + font.name;        
            var width = ctx.measureText(str).width;
            return width/2;
        },
        showOptions(){
            if(this.optionsDisplay == 'none'){
                this.optionsDisplay = 'flex';
                this.animationArrow = 'spin-up';
            }
            else{
                this.optionsDisplay = 'none';
                this.animationArrow = 'spin-down';
            }
        },
        showColorPanel(){
            if(this.displayColorPanel == 'none'){
                this.displayColorPanel = 'block';
            }
            else{
                this.displayColorPanel = 'none';
            }
        },
        hideColorPanel(){
            this.displayColorPanel = 'none';
        },
        async modifyPdf() {
            if(this.file){
                const pdfDoc = await PDFDocument.load(this.arrayBuffer as ArrayBuffer)
                const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
                const pages = pdfDoc.getPages()
                const firstPage = pages[0]
                const { width, height } = firstPage.getSize()
                this.pdfWidth = width
                this.pdfHeight = height
                var finalText = this.text
                for(let i=1; i < this.recurrenceLine; i++) {
                    finalText += " " + this.text
                }
                var h = 0
                var j = 0
                switch (this.degree) {
                    case "-45":
                        h = height;
                        break;
                    case "0":
                        h = height / 2;
                        break;
                    case "45":
                        h = 0;
                        break;
                    case "90":
                        h = 0;
                        break;
                    default:
                }
                if(this.degree == "0"){
                    for(let i=height/(this.numberLine+1); i < height; i+=height/(this.numberLine+1)){
                        firstPage.drawText(finalText, {
                            x: 0,
                            y: i,
                            size: this.sizeFont,
                            font: helveticaFont,
                            color: rgb(this.colorFont.rgba.r/255, this.colorFont.rgba.g/255, this.colorFont.rgba.b/255),
                            rotate: degrees(parseInt(this.degree)),
                            opacity: this.colorFont.rgba.a
                        })
                    }
                }
                else if(this.degree == "90"){
                    for(let i=width/(this.numberLine+1); i < width; i+=width/(this.numberLine+1)){
                        firstPage.drawText(finalText, {
                            x: i,
                            y: h,
                            size: this.sizeFont,
                            font: helveticaFont,
                            color: rgb(this.colorFont.rgba.r/255, this.colorFont.rgba.g/255, this.colorFont.rgba.b/255),
                            rotate: degrees(parseInt(this.degree)),
                            opacity: this.colorFont.rgba.a
                        })
                    }
                }
                else{
                    for(let i=width/(this.numberLine+1); i < width; i+=width/(this.numberLine+1)){
                        firstPage.drawText(finalText, {
                            x: i - height/2,
                            y: h,
                            size: this.sizeFont,
                            font: helveticaFont,
                            color: rgb(this.colorFont.rgba.r/255, this.colorFont.rgba.g/255, this.colorFont.rgba.b/255),
                            rotate: degrees(parseInt(this.degree)),
                            opacity: this.colorFont.rgba.a
                        })
                    }
                }
                

                this.pdfBytes = await pdfDoc.save()
                this.base64 = await bufferToBase64(this.pdfBytes) as string
                //this.base64 = "data:application/pdf;base64," + Base64.encode(new TextDecoder('utf8').decode(this.pdfBytes))
            }
            
        }
    }
})

</script>

<template>
    <div class="main">
        <h1>Ajoutez un filigrane à n'importe quel document pdf sans risque</h1>
        <div class="pen">
            <svg
                width="120.14106mm"
                height="25.685461mm"
                viewBox="0 0 120.14106 25.685461"
                version="1.1"
                id="svg5"
                inkscape:version="1.2.2 (732a01da63, 2022-12-09)"
                sodipodi:docname="simple_pen.svg"
                xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:svg="http://www.w3.org/2000/svg">
                <sodipodi:namedview
                    id="namedview7"
                    pagecolor="#ffffff"
                    bordercolor="#000000"
                    borderopacity="0.25"
                    inkscape:showpageshadow="2"
                    inkscape:pageopacity="0.0"
                    inkscape:pagecheckerboard="0"
                    inkscape:deskcolor="#d1d1d1"
                    inkscape:document-units="mm"
                    showgrid="false"
                    inkscape:zoom="1"
                    inkscape:cx="221.5"
                    inkscape:cy="149.5"
                    inkscape:window-width="1920"
                    inkscape:window-height="1001"
                    inkscape:window-x="-9"
                    inkscape:window-y="-9"
                    inkscape:window-maximized="1"
                    inkscape:current-layer="layer3" />
                <defs
                    id="defs2" />
                <g
                    inkscape:groupmode="layer"
                    id="layer2"
                    inkscape:label="carte"
                    transform="translate(-222.81112,-28.558204)" />
                <g
                    inkscape:groupmode="layer"
                    id="layer3"
                    inkscape:label="stylo"
                    transform="translate(-222.81112,-28.558204)">
                    <path
                    id="rect2491"
                    style="fill:#282828;stroke:#282828;stroke-width:0;stroke-linecap:round;stroke-dasharray:none;paint-order:fill markers stroke"
                    d="m 242.44791,28.573098 -19.63679,5.415895 19.63843,5.409985 z m 3.77935,-5.62e-4 0.002,10.825873 81.44022,-0.01224 0.002,10.982229 -27.18874,0.0041 c -1.17734,1.67e-4 -2.125,0.863587 -2.12484,1.935903 1.4e-4,1.072314 0.94809,1.935437 2.12541,1.935264 l 29.31457,-0.0044 c 1.1773,-1.77e-4 2.12498,-0.863591 2.12482,-1.935907 -7.2e-4,-0.0088 2.6e-4,-0.01628 -4.9e-4,-0.02498 l -0.002,-12.891183 10.33037,-0.0031 c 0.38874,-7.7e-5 0.70166,-0.504275 0.7016,-0.85834 l -10e-4,-9.255501 c 3.9e-4,-0.354069 -0.4533,-0.712104 -0.84206,-0.712049 l -10.20343,0.0015 0.003,10.810546 -4.23344,6.24e-4 -0.002,-10.810549 z" />
                    <g
                    id="rect2648"
                    transform="rotate(-30.081268)" />
                </g>
                </svg>
            <div class="background"></div>
        </div>
        <object class="mg-bt-30" :data="get_file_base64()" type="application/pdf"/>
        <div class="mg-bt-30 mg-lf-30">
            <label class="pdfButton mg-rg-5" for="pdfFile">Choisir un fichier</label>
            <span class="pdfName">{{file?file.name:''}}</span>
            <input id="pdfFile"
                type="file"
                @change="onFileChanged($event)"
                accept=".pdf"
            />
        </div>
        <label class="mg-bt-10" for="text">Indiquez le filigrane à insérer : </label>
        <input class="mg-bt-30" id="text" type="text" size="100" @change="modifyPdf()" v-model="text">
        <div class="options">
            <button class="moreOptions" @click="showOptions()"><i class="fas fa-arrow-down fa-spin" :style="{'animation-name': animationArrow}"></i> {{animationArrow=='spin-up'?"Moins d'options":"Plus d'options"}} </button>
            <div class="hideOptions" :style="{'display': optionsDisplay}">
                <div class="column mg-bt-30">
                    <div>
                        <label class="mg-rg-5" for="size">Choisissez la taille de la police : </label>
                        <input id="size" type="number" @change="modifyPdf()" v-model="sizeFont">
                    </div>
                    <div>
                        <label class="mg-rg-5" for="color">Choisissez la couleur de la police : </label>
                        <button class="colorSelector" @click="showColorPanel()" :style="{'background-color': colorFont.hex8}"></button>
                        <Chrome class="color" id="color" v-model="colorFont" :style="{'display': displayColorPanel}"/>
                    </div>
                </div>
                <div class="column mg-bt-30">
                    <div>
                        <label class="mg-rg-5" for="recurrence">Choisissez le nombre de répétition sur une ligne : </label>
                        <input id="recurrence" type="number" @change="modifyPdf()" v-model="recurrenceLine"/>
                    </div>
                    <div>
                        <label class="mg-rg-5" for="line">Choisissez le nombre de ligne : </label>
                        <input id="line" type="number" @change="modifyPdf()" v-model="numberLine"/>
                    </div>
                </div>
                <fieldset class="degree">
                    <legend>Choisissez l'orientation du texte : </legend>
                    <div>
                        <input id="\" type="radio" name="degree" value="-45" @change="modifyPdf()" v-model="degree"/>
                        <label for="\">45° vers la gauche (\)</label>
                    </div>
                    <div>
                        <input id="horizontal" type="radio" name="degree" value="0" @change="modifyPdf()" v-model="degree"/>
                        <label for="horizontal">Horizontale</label>
                    </div>
                    <div>
                        <input id="/" type="radio" name="degree" value="45" @change="modifyPdf()" v-model="degree"/>
                        <label for="/">45° vers la droite (/)</label>
                    </div>
                    <div>
                        <input id="vertical" type="radio" name="degree" value="90" @change="modifyPdf()" v-model="degree"/>
                        <label for="vertical">Verticale</label>
                    </div>
                </fieldset>
            </div>
        </div>
        <div class="bot" :style="{'top': optionsDisplay=='none'?'500px':'755px'}">
            <button class="download" @click="download_pdf()"><b>Télécharger</b></button>
        </div>
    </div>
</template>
