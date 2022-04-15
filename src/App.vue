<template>
  <MainLoading v-if="loading" />
  <n-config-provider :local="zhCN" :date-locale="dateZhCN">
    <!-- 日历视图 -->
    <div id="calender" v-if="isCalendarDataPrepared">
      <n-calendar
        #="{ year, month, date }"
        :default-value="calendarTime"
        :value="calendarTime"
      >
        {{ year }}-{{ month }}-{{ date }}
        <br>
        <n-popover trigger="hover" v-for="(item, index) in getTodoList(year, month, date)" :key="index">
          <template #trigger>
            <span class="arrangement" v-if="item.isFinished === 0" :style="item.style">
              {{item.title}}&ensp;&ensp;{{item.time}}
              <br>
            </span>
            <span class="arrangement" v-else-if="item.isFinished === 1" style="background-color: grey">
              <del>{{item.title}}&ensp;&ensp;{{item.time}}</del>
              <br>
            </span>
          </template>
          <h2>{{item.title}}</h2>
          <p>{{item.content}}</p>
          <p>{{item.date}}&ensp;{{item.time}}</p>
          <n-button v-if="item.isFinished === 0" quaternary type="primary" @click="changeFinish(item, 1)">
            完成
          </n-button>
          <span v-else-if="item.isFinished === 1" style="color: #18A058">
            已完成
          </span>
        </n-popover>
      </n-calendar>
    </div>
  </n-config-provider>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import MainLoading from './components/MainLoading.vue'
import { NCalendar, NConfigProvider, NPopover, NButton, darkTheme, zhCN, dateZhCN } from 'naive-ui'

// 全局化配置
function configHandler () {
  return {
    darkTheme,
    zhCN,
    dateZhCN
  }
}

// 管理日历的函数
function canlendarHandler () {

  /* let data:Array<IToDoListItem> = [] */
  let data = reactive([])

  const time = Date.now()
  const calendarTime = ref(time)
  const isCalendarDataPrepared = ref(false)

  onMounted(() => {
    /* axios.get('/todoList_jsonDB.json').then((res:IResponseBody<IToDoListItem>) => {
      if (res.data) {
        data = res.data.data as Array<IToDoListItem>
      }
      isCalendarDataPrepared.value = true
    }).catch(err => {
      console.log(err)
    }) */
    isCalendarDataPrepared.value = true
  })

  const getTodoList = (year, month, date) => {
    const dateStr = `${year}-${month}-${date}`
    const list = []
    for (let i = 0; i < data.length; i++) {
      if (dateStr === data[i].date) {
        list.push(data[i])
      }
    }
    return list
  }

  const changeFinish = (item, flag) => {
    for (let i = 0; i < data.length; i++) {
      if (JSON.stringify(item) === JSON.stringify(data[i])) {
        data[i].isFinished = flag
        break
      }
    }
    // 用于刷新
    isCalendarDataPrepared.value = false
    isCalendarDataPrepared.value = true
  }

  return {
    calendarTime,
    getTodoList,
    isCalendarDataPrepared,
    changeFinish
  }
}

export default {
  components: {
    MainLoading,
    NCalendar,
    NPopover,
    NConfigProvider,
    NButton
  },
  setup () {
    const loading = ref(true)

    onMounted(() => {
      setTimeout(() => {
        loading.value = false
      }, 1000)
    })

    const { calendarTime, getTodoList, isCalendarDataPrepared, changeFinish } = canlendarHandler()
    const { zhCN, dateZhCN } = configHandler()

    return {
      loading,
      calendarTime,
      getTodoList,
      changeFinish,
      isCalendarDataPrepared,
      zhCN,
      dateZhCN
    }
  }
}
</script>

<style>
  #header {
    position: relative;
    top: 0;
    width: 80%;
    display: flex;
    justify-content: space-between;
    margin: 10px auto;
  }
  #calender {
    width: 80%;
    margin: auto;
    padding: 20px;
  }
  .events {
    list-style-type: none;
  }
  .arrangement {
    border-radius: 5px;
    margin-top: 3px;
    /* background-color: red; */
    padding: 2px 5px;
    font-size: 10px;
    color: white;
    display: block;
  }
  #calenderTimePicker {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
  }
</style>
