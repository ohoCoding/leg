import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { getCompleteOrderListAPI, getAccessToken } from '../../config/AxiosFunction';
import { Dimensions, ActivityIndicator, ScrollView } from "react-native";
import { intialOrderInfo, OrderInfo } from '../../models/orderInfo';

type BottomPopupProps = {
  goReview: any
}
type OrderCompleteProps = {
  route: any;
  navigation?: any;
}

const width = Dimensions.get('window').width;

const CompleteList = (props: BottomPopupProps, { navigation, route }: OrderCompleteProps) => {

  const [OrderCompeteLst, setOrderCompeteLst] = useState<OrderInfo[]>([intialOrderInfo]);
  const [ready, setReady] = useState<boolean>(true);

  useEffect(() => {
    getCompleteOrderList();
  }, [])


  //날짜 형태 변환
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
      let compDay = new Date(param).getTime();

      let result: any = Math.floor((+(today) - +(compDay)) / 1000 / 60 / 60)
      if (result > 24) {
        result = Math.floor(result / 24)
        if (result > 7) {
          result = '7일 이전'
        }
        else
          result = result + '일 후'
      }
      else if (result == 0) {
        result = Math.floor((+(today) - +(compDay)) / 1000 / 60) + '분 후'
      }
      else {
        result = result + '시간 후'
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

  const getCompleteOrderList = async () => {
    // const accessToken = await getAccessToken('accessToken');

    //임시 accessToken값
    const response: any = await getCompleteOrderListAPI('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJsZWciLCJpYXQiOjE2NzE0MTA4NzEsInN1YiI6IjEwMTYiLCJ0b2tlblR5cGUiOnRydWUsImFjY291bnRUeXBlIjoiVVNFUiIsInJvbGVzIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV19.U-FmO73zLO6mm2Mt5QPN3NLIXfHwom7xmeoamhCA4wjRoOO6dqm36uj0G5x-1QhKzXOtdBaT0ThIef8SmP7usA');
    // setOrderCompeteLst(response.data.content);

    for (const key in response.data.content) {
      setOrderCompeteLst(() => {
        return [
          {
            id: response.data.content[key]['id'],
            storeProfile: response.data.content[key]['storeProfile'],
            storeName: response.data.content[key]['storeName'],
            simpleMenu: response.data.content[key]['simpleMenu'],
            finalPrice: response.data.content[key]['finalPrice'],
            status: response.data.content[key]['pickUpAt'],
            acceptAt: response.data.content[key]['acceptAt'],
            pickUpAt: Datefilter('pickUpAt', response.data.content[key]['pickUpAt']),
            orderAt: Datefilter('orderAt', response.data.content[key]['orderAt']),
            doneAt: Datefilter('doneAt', response.data.content[key]['doneAt']),
          },
        ]
      });
    }
    setReady(false);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {ready ?
        <View style={[OrderWrapper.container, OrderWrapper.horizontal]}>
          <ActivityIndicator size="large" />
        </View>
        :
        <ScrollView>
          {OrderCompeteLst.length !== undefined &&
            OrderCompeteLst?.map((order: OrderInfo, index: number) => {
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
                            source={{ uri: order.storeProfile }}
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
                          }]}>{order.doneAt}</Text>
                        </View>
                      </View>
                      <View style={OrderWrapper.Horizontal}>
                        <TouchableOpacity
                          style={OrderWrapper.ActivateButton}
                          onPress={() => {
                            console.log(OrderCompeteLst)
                            props.goReview()
                          }}>
                          <Text style={OrderWrapper.ButtonText}>포장 완료</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View >
                </SafeAreaView>
              )
            })}
          {OrderCompeteLst.length === undefined &&
            <View><Text>데이터가 없습니다.</Text></View>
          }
        </ScrollView>
      }
    </SafeAreaView>
  );
};

export const OrderWrapper = StyleSheet.create({
  MainContainer: {
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

export default CompleteList;
