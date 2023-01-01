export interface OrderInfo {
    id: number,
    storeId: number
    orderAt: string,
    storeProfile: string,
    storeName: string,
    simpleMenu: string,
    finalPrice: number,
    pickUpAt? : string,
    acceptAt: string,
    doneAt: string,
    status: string,
    orderNo:string,
    isReviewed:boolean,
}

// export const intialOrderInfo: OrderInfo = {
//     id: 0,
//     orderAt: '',
//     storeProfile: '',
//     storeName: '',
//     simpleMenu: '',
//     finalPrice: 0,
//     pickUpAt: '',
//     acceptAt: '',
//     doneAt: '',
//     status: ''
// }

export interface DistanceInfo {
    distance: string
}

export const initialDistanceInfo: DistanceInfo = {
    distance: '',
}

export interface OrderSmpInfo {
    id: number,
    simpleMenu: string,
    finalPrice: number,
    requirements: string,
    status: string,
    pickUpAt: string
}

export const initialOrderSmpInfo: OrderSmpInfo = {
    id: 0,
    simpleMenu: '',
    finalPrice: 0,
    requirements: '',
    status: '',
    pickUpAt: ''
}

export interface OrderFinishInfo {
    id: number,
    finalPrice: number,
    distance: number,
    maxRewardRatio: number,
    maxRewardDistance: number,
    reward: number
}

export const initialOrderFinishInfo: OrderFinishInfo = {
    id: 0,
    finalPrice: 0,
    distance: 0,
    maxRewardRatio: 0,
    maxRewardDistance: 0,
    reward: 0
}