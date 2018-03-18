import { Component } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {
  HomeService
} from './services/servicesLocal';
import {
  BaseList,
  TotalAmount
} from './models/models';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [HomeService]
})

export class HomeComponent {
  public baseList: Array<BaseList> = [];
  public baseListFilter: Array<BaseList> = [];
  public adminMode: boolean = false;
  public onlyFilled: boolean = false;
  private timer: any = null;
  public totalAmountData: TotalAmount = {
    currencyValue: 0,
    totalUAH: 0,
    totalUAH25: 0,
    totalUSD: 0,
    totalUSD21: 0,
    USDUAH: 0,
    notCountedTotalUAH: 0,
    notCountedTotalUSD: 0,
    notCountedTotalUAH20: 0,
    notCountedTotalUSD20: 0,
  };
  public orderId: string = '';
  public orderDate: string = '';
  public totalGoods: string = '';
  public notCounted: string = '';
  public uploadedFileData: Array<{
    sku: string,
    amount: number
  }> = [];
  public uploadedFileDataNotInBase: Array<{
    sku: string,
    amount: number
  }> = [];
  public currensyType: {
     usd: string,
    uah: string
  } = {
    usd: "$",
    uah: "₴"
  };

  constructor(
    private homeService: HomeService,
    public sanitizer: DomSanitizer
  ){ }

  ngOnInit() {
    this.getData();
  }
  private getData () {
    this.homeService.getData()
      .subscribe((response: any) => {
        this.baseList = response.json();
        this.baseListFilter = this.baseList.map((item: BaseList) => Object.assign({}, item));
        console.log(response.json());
      })
  }
  public changelAmount(event: any, id: string) {
    const value = event.target.value;
    const makeWrite = () => {
      this.baseList = this.baseList.map((item: BaseList) => {
        if (item.sku === id) {
          item.amount = (+value);
        }
        return item;
      });

      this.calculateTotalPrice();
    };
    clearTimeout(this.timer);
    this.timer = setTimeout(makeWrite, 500);
  }
  private calculateTotalPrice () {
    const twoNumberAfterComma = (num: number): number => +num.toFixed(2);
    this.totalAmountData.totalUAH = 0;
    this.totalAmountData.totalUAH25 = 0;
    this.totalAmountData.totalUSD = 0;
    this.totalAmountData.totalUSD21 = 0;
    this.totalAmountData.USDUAH = 0;

    this.baseList.forEach((item: any) => {
      switch (item.currency) {
        case "UAH":
          if (!item.dontCount) {
            let amount = parseInt(item.amount);
            if (isNaN(amount)) amount = 0;
            let price = parseFloat(item.price);
            if (isNaN(price)) price = 0;
            this.totalAmountData.totalUAH += amount * price;
            this.totalAmountData.totalUAH25 += amount * price / 1.25;
          }
          break;
        case "EUR":
        case "USD":
          if (!item.dontCount) {
            let amount = parseInt(item.amount);
            if (isNaN(amount)) amount = 0;

            let price = parseFloat(item.price);
            if (isNaN(price)) price = 0;

            this.totalAmountData.totalUSD += amount * price;
            this.totalAmountData.totalUSD21 += ((amount * price) / 1.46) * 1.21;
            this.totalAmountData.USDUAH = this.totalAmountData.totalUSD * this.totalAmountData.currencyValue;

          }
          break;
      }
      this.totalAmountData.totalUAH = parseInt(this.totalAmountData.totalUAH.toString());
      this.totalAmountData.totalUAH25 = parseInt(this.totalAmountData.totalUAH25.toString());
      this.totalAmountData.totalUSD = twoNumberAfterComma(this.totalAmountData.totalUSD);
      this.totalAmountData.totalUSD21 = twoNumberAfterComma(this.totalAmountData.totalUSD21);
      this.totalAmountData.USDUAH = twoNumberAfterComma(this.totalAmountData.USDUAH);

    });
  }
  public filterData(event: any) {
    if (event === 'clear') {
      this.resetData();
      return;
    }
    const value = event.target.value;
    const doSearch = () => this.baseList = this.baseListFilter.filter((item: BaseList) => item.sku.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    clearTimeout(this.timer);
    this.timer = setTimeout(doSearch, 500);
  }
  private resetData () {
    this.baseList = this.baseListFilter.map((item: BaseList) => Object.assign({}, item));
    this.orderId = '';
    this.orderDate = '';
    this.totalGoods = '';
    this.notCounted = '';
    this.totalAmountData.notCountedTotalUAH = 0;
    this.totalAmountData.notCountedTotalUSD = 0;

  }
  public changeAdminMode(){
    this.adminMode  = ! this.adminMode;
  }
  public changeCurrency(event: any) {
    const value = +event.target.value;
    console.log(value)
    console.log(this.totalAmountData)
    this.totalAmountData.currencyValue = value;
    this.totalAmountData.USDUAH = (+(this.totalAmountData.totalUSD * value).toFixed(2));
  }
  public getFile (event: any) {
    const file = event.target.files[0];
    if(!file){
      return;
    }
    this.resetData();
    const reader: any = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      const result: Array<string> = reader.result.replace(/^data.+base64,/, '').split("\r\n");
      this.uploadedFileData = result
        .filter((item: string) => item.length > 0)
        .map((item: string, index: number) => {
          if (item !== '' && item.length > 1) {
            if (index === 0) {
              this.orderId = item.split(";")[0];
              this.orderDate = item.split(";")[1];
            }
            return {sku: item.split(";")[2], amount: parseInt(item.split(";")[3]), price: parseFloat(item.split(";")[4])};
          }
        });
      this.totalGoods = this.uploadedFileData.length.toString() +  " Total goods";
      console.log("uploadedFileData: ", this.uploadedFileData);
      this.fillDataOnPage();
      this.calculateNotInBaseGoods();
      // showUploadedData(uploadedArray);
    };
  }
  private calculateNotInBaseGoods(){
    this.uploadedFileDataNotInBase = [];
    this.totalAmountData.notCountedTotalUAH = 0;
    this.totalAmountData.notCountedTotalUSD = 0;
    this.uploadedFileData.forEach((uploadedItem: any) => {
      let founded = false;
      for (let i = 0; i < this.baseList.length; i++) {
        const baseItem = this.baseList[i];
        if (uploadedItem.sku === baseItem.sku) {
          founded = true;
          if (baseItem.dontCount) {
            this.uploadedFileDataNotInBase.push(baseItem);
          }
          return;
        }
      }
      if(!founded){
        this.uploadedFileDataNotInBase.push(uploadedItem);
      }
    });
    console.log("this.uploadedFileDataNotInBase: ", this.uploadedFileDataNotInBase);
    this.notCounted = this.uploadedFileDataNotInBase.length.toString() + " not in Base!";

    this.uploadedFileDataNotInBase.forEach((item: any) => {
      if(item.hasOwnProperty("currency")){
        if(item.currency === "USD"){
          this.totalAmountData.notCountedTotalUSD += +item.price * +item.amount;
        }
        if (item.currency === "UAH"){
          this.totalAmountData.notCountedTotalUAH += +item.price * +item.amount;
        }
      }else{
        this.totalAmountData.notCountedTotalUAH += +item.price * +item.amount;
      }
    });
    this.totalAmountData.notCountedTotalUSD = +(this.totalAmountData.notCountedTotalUSD.toFixed(2));
    this.totalAmountData.notCountedTotalUAH = parseInt(this.totalAmountData.notCountedTotalUAH.toString());

    this.totalAmountData.notCountedTotalUSD20 = +(this.totalAmountData.notCountedTotalUSD / 1.23).toFixed(2);
    this.totalAmountData.notCountedTotalUAH20 = parseInt((+this.totalAmountData.notCountedTotalUAH / 1.23).toString());
  }
  public makeSafeUrl(imageUrl: string){
    return this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl.split(',')[0]);
  }
  private fillDataOnPage () {
    this.uploadedFileData.forEach((uploadedItem: any) => {
      this.baseList = this.baseList.map((baseItem: any) => {
        const uploadedSku = uploadedItem.sku;
        if (uploadedSku === baseItem.sku) {
          baseItem.amount= uploadedItem.amount;
        }
        return baseItem;
      })
    });

    this.calculateTotalPrice();
    this.showOnlyFilled();
  };
  public showOnlyFilled() {
    // this.onlyFilled = !this.onlyFilled;
    // if (!this.onlyFilled) {
    //   this.baseList = this.baseListFilter.map((item: any) => Object.assign({}, this.baseList, item))
    // }
    this.baseList = this.baseList.filter((item: BaseList) => item.amount !== 0);
  }

  public saveToDB(){
  }
  public onCheckCheckBox(target: any){

  }
}


