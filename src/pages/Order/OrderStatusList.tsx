import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Dimensions } from "react-native";
import { getInProgressOrderListAPI, getAccessToken, orderFinishAPI, orderCancleAPI } from '../../config/AxiosFunction';
import { OrderInfo } from '../../models/orderInfo';
import { useSelector, useDispatch } from 'react-redux';
import {
  doTimer,
} from '../../slices/time';
import OrderConfirmPopUp from "../../components/Modal/OrderConfirmPopUp";

type BottomPopupProps = {
  goStatus: any
}

type OrderStatusListProps = {
  route: any;
  navigation?: any;
}
const width = Dimensions.get('window').width;
const OrderStatusList = (props: BottomPopupProps, { navigation, route }: OrderStatusListProps) => {
  const dispatch = useDispatch();
  //임시 accessToken 
  const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJsZWciLCJpYXQiOjE2NzIyOTQ2MDAsInN1YiI6IjExIiwidG9rZW5UeXBlIjp0cnVlLCJhY2NvdW50VHlwZSI6IlVTRVIiLCJyb2xlcyI6W3siYXV0aG9yaXR5IjoiUk9MRV9VU0VSIn1dfQ.IrcHhRVSYtyu5txFOhcgF-4oYLlCi7TQd7v5hGPxJaGEJOcOuB1X3jUQR88FU68foc6FMPw_UASxRiBaclkplg'
  const [OrderLst, setOrderLst] = useState<OrderInfo[]>([]);
  const [ready, setReady] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number>(0)

  useEffect(() => {
    getOrderList();
    setTimeout(() => {
      setReady(false);
    }, 100)
  }, [])

  /*Confrim Modal Component*/
  const closeModal = () => {
    setModalOpen(false);
  }
  //Modal Oepn, Set selected item Id 
  const openModal = (param: number) => {
    setSelectedItemId(param)
    setModalOpen(true);
  }
  //Do not action
  const openResult = () => {
    console.log("Do not anything")
  }
  //OrderConfirmPopUp confrim Modal에서 취소 확인 클릭 시 
  const openCancle = async () => {
    await orderCancleAPI(accessToken, selectedItemId);
    setModalOpen(false);
  }
  /*Modal End*/

  //상품 상세페이지 이동, redux store상태 변경 
  const goStatus = async (param: any) => {
    const response: any = await getInProgressOrderListAPI(accessToken);
    const findResult = response.data.content.find((val: { id: number }) => val.id === param.id);
    dateFilter('pickUpAt', { date: findResult.pickUpAt });
    props.goStatus(param);
  }

  //시간만료된 상품 자동종료
  // const doFinish = async (id: number) => {
  //   const response: any = await orderFinishAPI(accessToken, id);
  //   console.log("결과", response)
  // }

  /* Date Fomrat을 변경하기 위한 함수 */
  const dateFilter = (val: string, param?: any) => {
    if (param.date == null) {
      return '없음'
    }
    else if (param.date !== null) {
      let fullDate = param.date.toString().replace('T', ' ')
      let dayStr = new Date(param.date)
      const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
      let week = WEEKDAY[dayStr.getDay()];
      let year = fullDate.slice(2, 4);
      let month = fullDate.slice(5, 7);
      let day = fullDate.slice(8, 10);
      let time = fullDate.slice(11, 16);
      if (val === 'pickUpAt') {
        let today = new Date().getTime();
        let compDay = new Date(param.date).getTime();

        let result: any = Math.floor((+(compDay) - +(today)) / 1000 / 60 / 60)

        if (result >= 0) {
          let data = (+(compDay) - +(today)) / 1000 / 60

          //한시간 이상
          if (result >= 1) {
            let hh = data / 60;
            let mm = data % 60;
            result = `${Math.floor(hh)}시간 ${Math.floor(mm)}분 후`
          } else {
            result = Math.floor(data) + '분 후'
          }
          const timeSetParam = {
            t_minutes: Math.floor(data)
          }
          dispatch(doTimer(timeSetParam));
        }
        else {
          // doFinish(param.id);
          dispatch(doTimer({ t_minutes: 0 }));
          result = '시간만료'
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
  }

  /* OrderList Data */
  const getOrderList = async () => {
    // const accessToken = await getAccessToken('accessToken');
    //임시 accessToken값
    const response: any = await getInProgressOrderListAPI(accessToken);

    for (const key in response.data.content) {
      setOrderLst(OrderLst => [...OrderLst,
      {
        id: response.data.content[key]['id'],
        storeId: response.data.content[key]['storeId'],
        storeProfile: response.data.content[key]['storeProfile'],
        storeName: response.data.content[key]['storeName'],
        simpleMenu: response.data.content[key]['simpleMenu'],
        finalPrice: response.data.content[key]['finalPrice'],
        status: response.data.content[key]['status'],
        acceptAt: response.data.content[key]['acceptAt'],
        pickUpAt: dateFilter('pickUpAt', { date: response.data.content[key]['pickUpAt'], id: response.data.content[key]['id'] }),
        orderAt: dateFilter('orderAt', { date: response.data.content[key]['orderAt'], id: response.data.content[key]['id'] }),
        doneAt: response.data.content[key]['doneAt'],
        isReviewed: response.data.content[key]['isReviewed'],
        orderNo: response.data.content[key]['orderNo']
      },]);
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
                      <View style={[OrderWrapper.Vertical, { marginLeft: 5 }]}>
                        <Text style={OrderWrapper.FontText}>{order.orderAt}</Text>
                      </View>
                      <View style={OrderWrapper.Horizontal}>
                        <View style={OrderWrapper.CenterAlign}>
                          <Image
                            source={require('../../assets/main.png')}
                            // source={{ uri: order.storeProfile ? order.storeProfile : 'none' }}
                            style={{
                              width: 90,
                              height: 90,
                              aspectRatio: 1.1,
                              resizeMode: 'contain'
                            }}
                          />
                        </View>
                        <View
                          style={[OrderWrapper.Vertical, {
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
                            {order.status === "ACCEPT" ? order.pickUpAt : ''}
                          </Text>
                        </View>
                      </View>
                      <View style={OrderWrapper.Horizontal}>
                        {order.status === "REQUEST" &&
                          <>
                            <View
                              style={[OrderWrapper.InActivateButton, { flex: 2, margin: 5 }]}>
                              <Text style={OrderWrapper.ButtonText}>포장 요청</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => openModal(order.id)}
                              style={[OrderWrapper.ActivateButton, { flex: 2, margin: 5 }]}>
                              <Text style={OrderWrapper.ButtonText}>주문 취소</Text>
                            </TouchableOpacity>
                          </>
                        }

                        {order.status === "ACCEPT" &&
                          <>
                            {order.pickUpAt === "시간만료" ?
                              <TouchableOpacity
                                onPress={() =>
                                  goStatus(order)
                                }
                                style={[OrderWrapper.ActivateButton, { flex: 1 }]}>
                                <Text style={OrderWrapper.ButtonText}>주문 완료</Text>
                              </TouchableOpacity>
                              :
                              <TouchableOpacity
                                onPress={() =>
                                  goStatus(order)
                                }
                                style={[OrderWrapper.ActivateButton, { flex: 1 }]}>
                                <Text style={OrderWrapper.ButtonText}>주문 대기</Text>
                              </TouchableOpacity>
                            }
                          </>
                        }
                      </View>
                    </View>
                  </View >
                </SafeAreaView>
              )
            })}
          {OrderLst.length === 0 &&
            <View><Text>데이터가 없습니다.</Text></View>
          }
          <OrderConfirmPopUp
            id={selectedItemId}
            open={modalOpen}
            close={closeModal}
            title={"주문 취소"}
            subTitle={`선택하신 주문을 취소하시겠습니까?`}
            openResult={openResult}
            openCancle={openCancle}
          />

        </ScrollView>

      }
    </SafeAreaView>

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
  Vertical: {
    flexDirection: 'column'
  },
  Horizontal: {
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

export default OrderStatusList;
