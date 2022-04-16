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
          @update:value="clickCalendarItem"
        >
          {{ year }}-{{ month }}-{{ date }}
          <br>
          <n-popover trigger="hover" v-for="(item, index) in getTodoList(year, month, date)" :key="index">
            <template #trigger>
              <span class="arrangement" v-if="item.is_finished === 0" :style="'background-color: ' + item.style">
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
              <br>
            </span>
            <div style="display: flex; justify-content: space-between">
              <n-button v-if="item.is_finished === 0" tertiary type="primary" @click="changeFinish(item, 1)">
                完成
              </n-button>
              <n-button v-else-if="item.is_finished === 1" tertiary type="warning" @click="changeFinish(item, 0)">
                取消完成
              </n-button>
              <n-button quaternary circle type="error" @click="deleteItemCalendar(item)">
                <template #icon>
                  <n-icon><delete-icon /></n-icon>
                </template>
              </n-button>
            </div>
          </n-popover>
        </n-calendar>
      </div>
      <!-- 添加日程用的drawer -->
      <n-drawer v-model:show="isAddItemFormShow" :width="520" placement="left">
        <n-drawer-content closable>
          <template #header>
            添加新日程到&ensp;{{selectedDate}}
          </template>
          <n-form :model="addItemForm" label-placement="top" :rules="addItemFormRules" ref="addFormRef">
            <n-form-item label="标题" path="title">
              <n-input v-model:value="addItemForm.title" maxlength="10" show-count placeholder="输入日程标题" />
            </n-form-item>
            <n-form-item label="内容" path="content">
              <n-input v-model:value="addItemForm.content" maxlength="50" show-count placeholder="输入日程内容" type="textarea" />
            </n-form-item>
            <n-form-item label="时间" path="time">
              <n-time-picker v-model:formatted-value="addItemForm.time" placeholder="选择时间" format="HH:mm" value-format="HH:mm" />
            </n-form-item>
            <!-- <n-form-item label="时间" path="time">
              <n-input v-model:value="addItemForm.time" placeholder="输入时间" />
            </n-form-item> -->
            <n-form-item label="标记" path="style">
              <n-color-picker v-model:value="addItemForm.style" :show-alpha="false" />
            </n-form-item>
            <n-form-item>
              <n-button type="primary" @click="addItemCalendar">确认添加</n-button>
            </n-form-item>
          </n-form>
        </n-drawer-content>
      </n-drawer>
      <!-- ====================================================================================== -->
      <!-- ====================================================================================== -->
      <!-- ====================================================================================== -->
    </n-config-provider>
  </n-message-provider>
</template>

<script>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import MainLoading from './components/MainLoading.vue'
import { zhCN, dateZhCN } from 'naive-ui'
import {Delete24Regular as DeleteIcon} from '@vicons/fluent'
import sqlite3 from 'sqlite3'

// 这个databaseUrl是打包的时候用的
// const databaseUrl = '../bundled/easytodo_DB.db'

// 这个databaseUrl是在开发的时候用的
const databaseUrl = './easytodo_DB.db'

var DB = null

// ======================================================= 全局化配置
function configHandler () {
  return {
    zhCN,
    dateZhCN
  }
}

// ======================================================= 管理日历的函数
function canlendarHandler () {

  let data = []

  const time = Date.now()
  const calendarTime = ref(time)
  const selectedDate = ref('')
  const isCalendarDataPrepared = ref(false)
  const addFormRef = ref(null)
  // 用于添加日程的表单
  const addItemForm = reactive({
    title: '',
    content: '',
    time: '00:00',
    date: '',
    style: '#deb887',
    is_finished: 0
  })
  // 添加日程表单的校验规则
  const addItemFormRules = {
    title: [
      { required: true, message: '请输入日程标题', trigger: 'blur' }
    ],
    /* time: [
      { required: true, message: '请选择日程时间', trigger: 'blur' },
      { pattern: /^((1|0)[0-9]|2[0-3]):([0-5][0-9])$/, message: '请输入正确的时间格式，范围 00:00-23:59', trigger: 'blur' }
    ], */
    style: [
      { required: true, message: '请选择日程标记', trigger: 'blur' }
    ]
  }
  const isAddItemFormShow = ref(false)

  // 从数据库获取 todolist 数据
  function getTodoListFromDB () {
    return new Promise((resolve, reject) => {
      DB.all('select * from todolist order by date,time', (err, rows) => {
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

  // 获取日历每个单元格的日程
  const getTodoList = (year, month, date) => {
    // 补零操作，为了让数据库的数据能匹配到界面上的数据
    /* console.log(typeof month) */
    if (month < 10) {
      month = '0' + month
    }
    if (date < 10) {
      date = '0' + date
    }
    const dateStr = year + '-' + month + '-' + date
    /* console.log(dateStr) */
    const list = []
    for (let i = 0; i < data.length; i++) {
      if (dateStr === data[i].date) {
        list.push(data[i])
      }
    }
    return list
  }

  // 更改日程完成情况
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

  // 点击每个日期的时候发生的东西
  const clickCalendarItem = (timestamp, {year, month, date}) => {
    // 补零操作，为了让数据库的数据能匹配到界面上的数据
    if (month < 10) {
      month = '0' + month
    }
    if (date < 10) {
      date = '0' + date
    }
    calendarTime.value = timestamp
    selectedDate.value = `${year}-${month}-${date}`
    addItemForm.date = `${year}-${month}-${date}`
    isAddItemFormShow.value = true
  }

  // 添加日程
  const addItemCalendar = () => {
    addFormRef.value?.validate((errors) => {
      console.log(errors)
      if (!errors) {
        /* console.log('Valid')
        console.log(addItemForm) */
        // 校验成功，添加到数据库
        let insertStr = 'insert into todolist (title, content, time, date, style, is_finished) values ("' + addItemForm.title + '", "' + addItemForm.content + '", "' + addItemForm.time + '", "' + addItemForm.date + '", "' + addItemForm.style + '", ' + addItemForm.is_finished + ')'
        DB.run(insertStr, (err) => {
          if (err) {
            console.log(err)
            return
          }
          getTodoListFromDB().then(res => {
            data = res
            // 用于刷新
            refreshCalendarData()
            isAddItemFormShow.value = false
            // 重置表单
            addItemForm.title = ''
            addItemForm.content = ''
            addItemForm.time = '00:00'
            addItemForm.date = ''
            addItemForm.style = '#deb887'
            addItemForm.is_finished = 0
          }).catch(e => {
            console.log(e)
          })
        })
      } else {
        console.log('errors', errors)
      }
    })
  }

  // 删除日程
  const deleteItemCalendar = (item) => {
    let deleteStr = 'delete from todolist where id = ' + item.id
    DB.run(deleteStr, (err) => {
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
    changeFinish,
    addItemForm,
    isAddItemFormShow,
    selectedDate,
    clickCalendarItem,
    addItemCalendar,
    addItemFormRules,
    addFormRef,
    deleteItemCalendar
  }
}

// ======================================================= export default
export default {
  components: {
    MainLoading,
    DeleteIcon
  },
  setup () {

    /* window.$message = useMessage() */
    
    const loading = ref(true)

    const { calendarTime, getTodoList, isCalendarDataPrepared, changeFinish, addItemForm, isAddItemFormShow, selectedDate, clickCalendarItem, addItemCalendar, addItemFormRules, addFormRef, deleteItemCalendar } = canlendarHandler()
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
      dateZhCN,
      addItemForm,
      isAddItemFormShow,
      selectedDate,
      clickCalendarItem,
      addItemCalendar,
      addItemFormRules,
      addFormRef,
      deleteItemCalendar
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
