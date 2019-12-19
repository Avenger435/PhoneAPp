import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


interface ProcedureCallObj {
  procedureName: string;
  batchId: string;
  date: Date;
  systemNo: Number;
  environmentSelected: string;
  request_id: string;
}

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css']
})
export class TestingComponent implements OnInit, OnDestroy {
  filesToUpload: Array<File>;
  fileSelected: File;
  environments: string[] = [];
  systemNos: Number[] = [];
  environmentSelected: string;
  noEnvironmentFlag: boolean = false;
  noEnvironmentFlagDS = false;
  noFileFlag: boolean = false;
  responseMsg: string;
  dataSaved = false;
  pu_prBatchId: string;
  batchIdPromoJobs: string;
  systmNoSelected: string;
  procedureObj: any;
  date: Date;
  procedureExecuted: boolean = true;
  procedureResponse: string;
  showError: boolean = false;
  dataSeedErrorMsg: string;
  busy: Promise<any>;
  loading: boolean;
  message: string = null;
  aliveComponent: boolean = true;
  subscr: Subscription;
  request_id: string;
  status: string;
  fileReaded: any;
  csv: string = null;


  ngOnInit() {
  }

  ngOnDestroy() {

    this.aliveComponent = false;
  }

  constructor(
    private httpService: HttpClient
  ) {
    this.environments.push('ACP-01');
    this.environments.push('ACP-02');
    this.environments.push('ACP-03');
    this.environments.push('ACP-04');
    this.environments.push('Promo-10g');

  }

  fileChangeEvent(fileInput: any) {
    console.log("FileChangeEvent", fileInput);
    this.filesToUpload = <Array<File>>fileInput.target.files;
    this.fileSelected = fileInput.target.files.item(0);
  }

  onInput($event) {
    $event.preventDefault();
    console.log('selected: ' + $event.target.value);
    this.environmentSelected = $event.target.value;
  }

  validateFlag() {
    this.noEnvironmentFlag = false;
    this.noFileFlag = false;
    this.noEnvironmentFlagDS = false;
  }

  upload() {
    console.log("")
    this.responseMsg = '';
    this.dataSaved = false;

    if (typeof this.environmentSelected === 'undefined') {
      this.noEnvironmentFlag = true;
      return;
    }
    if (this.filesToUpload.length < 1) {
      this.noFileFlag = true;
      return;
    }
    this.makeFileRequest("http://localhost:8080/upload/", [], this.filesToUpload).then((result) => {
      console.log('upload => dataseeded done => result => ' + result);
      this.dataSaved = true;
      this.responseMsg = result.toString();
    }, (error) => {
      this.dataSaved = true;
      this.responseMsg = 'Failed.'; // error.toString();
    });
  }

  makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
    return new Promise((resolve, reject) => {
      const formData: any = new FormData();
      for (var i = 0; i < files.length; i++) {
        console.log('makeFileRequest => file[i].name =>' + files[i].name);
        console.log('file type => file[i].type => ' + files[i].type);
        formData.append("uploads[]", files[i], "file");
        // this.convertFile(files[i]);
        // console.log(files[i].)
        this.handleFileSelect(files[i]);
      }
      formData.append("environment", this.environmentSelected);
      this.httpService.post(url, formData).subscribe(
        data => {
          console.log('data came from server => ' + JSON.stringify(data));
          resolve(data);
        },
        (err: HttpErrorResponse) => {
          console.log('Server error as there is no proper server configured yet');
          //console.log('error came from server =>' + JSON.stringify(err));    // SHOW ERRORS IF ANY.
          reject(err);
        }
      );
    });
  }

  handleFileSelect(evt) {
    // var files = evt.target.files; // FileList object
    // var file = files[0];
    var reader = new FileReader();
    reader.readAsText(evt);
    reader.onload = (event) => {
      var csv = reader.result; // Content of CSV file
      let csvData = csv as string;
      let allTextLines = csvData.split(/\r\n|\n/);
      let headers = allTextLines[0].split(',');
      let lines = [];

      for (let i = 0; i < allTextLines.length; i++) {
        // split content based on comma
        let data = allTextLines[i].split(',');
        if (data.length == headers.length) {
          let tarr = [];
          for (let j = 0; j < headers.length; j++) {
            tarr.push(data[j]);
          }
          lines.push(tarr);
        }
      }
      console.log('the below is the data read from the csv file==> \n'+lines); //The data in the form of 2 dimensional array.
    }

  }



  unsubscribe() {
    this.subscr.unsubscribe();
  }
}
