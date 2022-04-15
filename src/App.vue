<template>
  <n-message-provider>
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
              <span class="arrangement" v-if="item.is_finished === 0" :style="'background-color: #' + item.style">
                {{item.title}}&ensp;&ensp;{{item.time}}
                <br>
              </span>
              <span class="arrangement" v-else-if="item.is_finished === 1" style="background-color: grey">
                <del>{{item.title}}&ensp;&ensp;{{item.time}}</del>
                <br>
              </span>
            </template>
            <h2>{{item.title}}</h2>
            <p>{{item.content}}</p>
            <p>{{item.date}}&ensp;{{item.time}}</p>
            <span v-if="item.is_finished === 1" style="color: #18A058">
              已完成
            </span>
            <n-button v-if="item.is_finished === 0" tertiary type="primary" @click="changeFinish(item, 1)">
              完成
            </n-button>
            <n-button v-else-if="item.is_finished === 1" quaternary type="error" @click="changeFinish(item, 0)">
              取消完成
            </n-button>
          </n-popover>
        </n-calendar>
      </div>
      <!-- ====================================================================================== -->
      <!-- ====================================================================================== -->
      <!-- ====================================================================================== -->
    </n-config-provider>
  </n-message-provider>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import MainLoading from './components/MainLoading.vue'
import { zhCN, dateZhCN } from 'naive-ui'
import sqlite3 from 'sqlite3'

// 这个databaseUrl是打包的时候用的
// const databaseUrl = '../bundled/easytodo_DB.db'

// 这个databaseUrl是在开发的时候用的
const databaseUrl = './easytodo_DB.db'

var DB = null

// 全局化配置
function configHandler () {
  return {
    zhCN,
    dateZhCN
  }
}

// 管理日历的函数
function canlendarHandler () {

  let data = []

  const time = Date.now()
  const calendarTime = ref(time)
  const isCalendarDataPrepared = ref(false)

  // 从数据库获取 todolist 数据
  function getTodoListFromDB () {
    return new Promise((resolve, reject) => {
      DB.all('select * from todolist', (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // 重新挂载数据
  function refreshCalendarData () {
    isCalendarDataPrepared.value = false
    isCalendarDataPrepared.value = true
  }

  onMounted(() => {
    getTodoListFromDB().then(res => {
      data = res
      isCalendarDataPrepared.value = true
    }).catch(e => {
      console.log(e)
    })
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
    let updateStr = 'update todolist set is_finished = ' + flag + ' where id = ' + item.id
    DB.run(updateStr, (err) => {
      if (err) {
        console.log(err)
        return
      }
      getTodoListFromDB().then(res => {
        data = res
        // 用于刷新
        refreshCalendarData()
      }).catch(e => {
        console.log(e)
      })
    })
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
    MainLoading
  },
  setup () {

    /* window.$message = useMessage() */
    
    const loading = ref(true)

    const { calendarTime, getTodoList, isCalendarDataPrepared, changeFinish } = canlendarHandler()
    const { zhCN, dateZhCN } = configHandler()

    DB = new sqlite3.Database(databaseUrl, (err) => {
      if (err) {
        console.error(err)
      }
      else{
        // 成功之后关闭加载界面
        setTimeout(() => {
          loading.value = false
        }, 3000)
      }
    })

    /* onMounted(() => {
      setTimeout(() => {
        if (databaseFail) {
          window.$message.error('抱歉，加载数据出现意外错误，请尝试重启程序')
        }
      }, 1000)   
    }) */

    onUnmounted(() => {
      DB.close()
    })

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
  ::-webkit-scrollbar {
  /*滚动条整体样式*/
  width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
  }
  ::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius   : 10px;
  background-color: rgb(139, 139, 139);
  background-image: -webkit-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.2) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.2) 75%,
      transparent 75%,
      transparent
  );
  }
  ::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  background   : #ededed;
  border-radius: 10px;
  }
</style>
