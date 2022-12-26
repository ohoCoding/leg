import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Dimensions } from "react-native";
import { getInProgressOrderListAPI, getAccessToken } from '../../config/AxiosFunction';
import {  OrderInfo } from '../../models/orderInfo';

type BottomPopupProps = {
  goStatus: any
  goTest: any
}
const width = Dimensions.get('window').width;

const OrderList = (props: BottomPopupProps) => {

  const [OrderLst, setOrderLst] = useState<OrderInfo[]>([]);
  const [ready, setReady] = useState<boolean>(true);


  const goStatus = (param: number) => {
    props.goStatus(param);
  }

  const goTest = () => {
    props.goTest();
  }

  useEffect(() => {
    // 아직 데이터가 없을때 바로 예외처리로 넘어가기 때문에 api 조회 주석처리
    setTimeout(() => {
      getOrderList();
      console.log("TQ",OrderLst.length)
      setReady(false);
    }, 500)
  }, [ready])

  const Datefilter = (val: string, param: string) => {
    let fullDate = param.toString().replace('T', ' ')
    let dayStr = new Date(param)
    const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
    let week = WEEKDAY[dayStr.getDay()];
    let year = fullDate.slice(2, 4);
    let month = fullDate.slice(5, 7);
    let day = fullDate.slice(8, 10);
    let time = fullDate.slice(11, 16);
    // return (param.toString().split('').filter((x: any) => x.match(/\d/)).join(''));
    if (val === 'pickUpAt') {
      let today = new Date().getTime();
      let compDay =
        // new Date(param).getTime();
        //Test용 시간
        new Date('2022-12-21T16:20:12.480Z').getTime();
      let result: any = Math.floor((+(compDay) - +(today)) / 1000 / 60 / 60)

      // if (result > 24) {
      //   result = Math.floor(result / 24)
      //   if (result > 7) {
      //     result = '7일 이전'
      //   }
      //   else
      //     result = result + '일 후'
      // }
      if (result >= 0) {
        result = Math.floor((+(compDay) - +(today)) / 1000 / 60) + '분 후'
      }
      else {
        result = '만료'
      }
      return result
    }
    else if (val === 'orderAt') {
      return `${year}.${month}.${day}(${week}) ${time} 주문`
    }
    else if (val === 'doneAt') {
      return `${year}.${month}.${day}(${week}) ${time} 완료`
    }
    else {
      return param;
    }
  }

  const getOrderList = async () => {
    // const accessToken = await getAccessToken('accessToken');
    //임시 accessToken값
    const response: any = await getInProgressOrderListAPI('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJsZWciLCJpYXQiOjE2NzE0MTA4NzEsInN1YiI6IjEwMTYiLCJ0b2tlblR5cGUiOnRydWUsImFjY291bnRUeXBlIjoiVVNFUiIsInJvbGVzIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV19.U-FmO73zLO6mm2Mt5QPN3NLIXfHwom7xmeoamhCA4wjRoOO6dqm36uj0G5x-1QhKzXOtdBaT0ThIef8SmP7usA');
    for (const key in response.data.content) {
      setOrderLst(() => {
        return [
          {
            id: response.data.content[key]['id'],
            storeProfile: response.data.content[key]['storeProfile'],
            storeName: response.data.content[key]['storeName'],
            simpleMenu: response.data.content[key]['simpleMenu'],
            finalPrice: response.data.content[key]['finalPrice'],
            status: response.data.content[key]['pickUpAt'],
            acceptAt: response.data.content[key]['acceptAt'],
            pickUpAt: response.data.content[key]['pickUpAt'],
            orderAt: Datefilter('orderAt', response.data.content[key]['orderAt']),
            doneAt: response.data.content[key]['doneAt'],
          },
        ]
      });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {ready ?
        <View style={[OrderWrapper.container, OrderWrapper.horizontal]}>
          <ActivityIndicator size="large" />
        </View>
        :
        <ScrollView>
          {OrderLst.length !== 0 &&
            OrderLst?.map((order: OrderInfo, index: number) => {
              return (
                <SafeAreaView style={OrderWrapper.MainContainer} key={index}>
                  <View style={OrderWrapper.CenterAlign} >
                    <View style={OrderWrapper.ContentsBox}>
                      <View style={[OrderWrapper.Horizontal, { marginLeft: 5 }]}>
                        <Text style={OrderWrapper.FontText}>{order.orderAt}</Text>
                      </View>
                      <View style={OrderWrapper.Vertical}>
                        <View style={OrderWrapper.CenterAlign}>
                          <Image
                            // source={require('../../assets/main.png')}
                            source={{ uri: order.storeProfile ? order.storeProfile : 'none' }}
                            style={{
                              width: 90,
                              height: 90,
                              aspectRatio: 1.1,
                              resizeMode: 'contain'
                            }}
                          />
                        </View>
                        <View
                          style={[OrderWrapper.Horizontal, {
                            marginLeft: 15,
                            padding: 15
                          }]}>
                          <Text style={[OrderWrapper.FontText,
                          {
                            fontSize: 15,
                            marginBottom: 10,
                            color: '#000000',
                            fontWeight: 'bold'
                          }]}>{order.storeName}</Text>

                          <Text style={[OrderWrapper.FontText,
                          {
                            marginBottom: 10,
                            color: '#000000',
                            fontWeight: '500',
                          }]}>{order.simpleMenu}</Text>
                          <Text style={[OrderWrapper.FontText,
                          {
                            color: '#00C1DE',
                            fontWeight: '600',
                          }]}>
                            {/* {order.pickUpAt} */}
                            {order.doneAt}
                          </Text>
                        </View>
                      </View>
                      <View style={OrderWrapper.Horizontal}>
                        <TouchableOpacity
                          onPress={() =>
                            goStatus(order.id)
                          }
                          style={OrderWrapper.InActivateButton}>
                          <Text style={OrderWrapper.ButtonText}>포장 대기</Text>
                        </TouchableOpacity>

                      </View>
                    </View>
                  </View >
                </SafeAreaView>
              )
            })}
          {OrderLst.length === 0 &&
            <View><Text>데이터가 없습니다.</Text></View>
          }
        </ScrollView>
      }
    </SafeAreaView>
    // <>
    //   <SafeAreaView style={OrderWrapper.MainContainer}>
    //     <View style={OrderWrapper.CenterAlign} >
    //       <View style={OrderWrapper.ContentsBox}>
    //         <View style={[OrderWrapper.Horizontal, { marginLeft: 5 }]}>
    //           <Text style={OrderWrapper.FontText}>09.11(월) 17:00주문</Text>
    //           {/* <Text>{orderList.orderDate}</Text> */}
    //         </View>
    //         <View style={OrderWrapper.Vertical}>
    //           <View style={OrderWrapper.CenterAlign}>
    //             <Image
    //               source={require('../../assets/main.png')}
    //               style={{
    //                 justifyContent: "center",
    //                 alignItems: 'center',
    //                 borderRadius: 20,
    //                 width: 90, height: 90
    //               }}
    //             />
    //           </View>
    //           <View
    //             style={[OrderWrapper.Horizontal, {
    //               marginLeft: 15,
    //               padding: 15
    //             }]}>
    //             <Text style={[OrderWrapper.FontText,
    //             {
    //               fontSize: 15,
    //               marginBottom: 10,
    //               color: '#000000',
    //               fontWeight: 'bold'
    //             }]}>미쁘동</Text>
    //             <Text style={[OrderWrapper.FontText,
    //             {
    //               marginBottom: 10,
    //               color: '#000000',
    //               fontWeight: '500',
    //             }]}>미쁘동 / 일회용품 선택 O</Text>
    //             <Text style={[OrderWrapper.FontText,
    //             {
    //               color: '#00C1DE',
    //               fontWeight: '600',
    //             }]}>픽업시간 18:00</Text>
    //           </View>
    //         </View>
    //         <View style={OrderWrapper.Horizontal}>
    //           <TouchableOpacity onPress={() => goStatus(9)}
    //             style={OrderWrapper.InActivateButton}>
    //             <Text style={OrderWrapper.ButtonText}>주문 현황</Text>
    //           </TouchableOpacity>
    //           <TouchableOpacity onPress={() => goTest()}
    //             style={OrderWrapper.InActivateButton}>
    //             <Text style={OrderWrapper.ButtonText}>테스트페이지이동</Text>
    //           </TouchableOpacity>
    //         </View>
    //       </View>
    //     </View >
    //   </SafeAreaView>
    // </>
  );
};


export const OrderWrapper = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: '#F3F3F3'
  },
  CenterAlign: {
    justifyContent: "center",
    alignItems: 'center',
  },
  ContentsBox: {
    borderWidth: 1,
    width: width,
    marginTop: 20,
    sborderRadius: 1,
    paddingLeft: 26,
    paddingRight: 26,
    paddingTop: 15,
    paddingBottom: 15,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: 'white',
  },
  Horizontal: {
    flexDirection: 'column'
  },
  Vertical: {
    flexDirection: 'row'
  },
  ActivateButton: {
    backgroundColor: '#00C1DE',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignContent: 'center'
  },
  InActivateButton: {
    backgroundColor: '#3E3E3E',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignContent: 'center'
  },
  ButtonText: {
    fontSize: 17,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center'
  },
  FontText: {
    fontFamily: 'Apple SD Gothic Neo',
    fontStyle: 'normal',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: 'background-color: rgba(0, 0, 0, 0.01)'
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  },
});

export default OrderList;
