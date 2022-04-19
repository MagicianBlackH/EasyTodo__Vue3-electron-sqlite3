<template>
  <n-message-provider>
    <MainLoading v-if="loading" />
    <n-config-provider :local="zhCN" :date-locale="dateZhCN">
      <!-- 日历视图 -->
      <div id="calender" v-if="isCalendarDataPrepared && isCalendarView">
        <n-button color="#8a2be2" @click="isCalendarView = false">
          <template #icon>
            <n-icon>
              <task-list-icon />
            </n-icon>
          </template>
          任务视图
        </n-button>
        <n-calendar
          #="{ year, month, date }"
          :default-value="calendarTime"
          :value="calendarTime"
          @update:value="clickCalendarItem"
        >
          {{ year }}-{{ month }}-{{ date }}
          <br>
          <n-popover trigger="hover" width="300px" v-for="(item, index) in getTodoListForCalendar(year, month, date)" :key="index">
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
      <n-drawer v-model:show="isAddItemFormForCalendarShow" :width="520" placement="left">
        <n-drawer-content closable>
          <template #header>
            添加新日程到&ensp;{{selectedDate}}
          </template>
          <n-form :model="addItemFormForCalendar" label-placement="top" :rules="addItemFormForCalendarRules" ref="addItemFormForCalendarRef">
            <n-form-item label="标题" path="title">
              <n-input v-model:value="addItemFormForCalendar.title" maxlength="10" show-count placeholder="输入日程标题" />
            </n-form-item>
            <n-form-item label="内容" path="content">
              <n-input v-model:value="addItemFormForCalendar.content" maxlength="50" show-count placeholder="输入日程内容" type="textarea" />
            </n-form-item>
            <n-form-item label="时间" path="time">
              <n-time-picker v-model:formatted-value="addItemFormForCalendar.time" placeholder="选择时间" format="HH:mm" value-format="HH:mm" />
            </n-form-item>
            <n-form-item label="标记" path="style">
              <n-color-picker v-model:value="addItemFormForCalendar.style" :show-alpha="false" />
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
      <!-- todoList视图 -->
      <div id="todolist" v-if="!isCalendarView && isTodoListDataPrepared">
        <div id="leftAddForm">
          <n-gradient-text :size="36" type="success">
            新增任务
          </n-gradient-text>
          <div style="height: 20px"></div>
          <n-form :model="addItemFormForTodoList" label-placement="top" :rules="addItemFormForTodoListRules" ref="addItemFormForTodoListRef">
            <n-form-item label="标题" path="title">
              <n-input v-model:value="addItemFormForTodoList.title" maxlength="10" show-count placeholder="输入日程标题" />
            </n-form-item>
            <n-form-item label="内容" path="content">
              <n-input v-model:value="addItemFormForTodoList.content" maxlength="50" show-count placeholder="输入日程内容" type="textarea" />
            </n-form-item>
            <n-form-item label="时间" path="datetime">
              <n-date-picker v-model:formatted-value="addItemFormForTodoList.datetime" type="datetime" placeholder="选择时间" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" />
            </n-form-item>
            <n-form-item label="标记" path="style">
              <n-color-picker v-model:value="addItemFormForTodoList.style" :show-alpha="false" />
            </n-form-item>
            <n-form-item>
              <n-button type="primary" @click="addItemTodoList">确认添加</n-button>
            </n-form-item>
          </n-form>
        </div>
        <div style="width: 2px; background: #cdcdcd"></div>
        <div id="rightTodoList">
          <n-gradient-text :size="36" type="info">
            任务列表
          </n-gradient-text>
          <n-button color="#8a2be2" @click="isCalendarView = true">
            <template #icon>
              <n-icon>
                <calendar-icon />
              </n-icon>
            </template>
            日历视图
          </n-button>
          <!-- <TodoItem title="哈哈哈" content="我哈哈大笑" :isFinished="false" date="2022-4-16" time="23:05" :style="'#00ff00'" /> -->
          <div v-for="(item, index) in getTodoListForTodoList()" :key="index">
            <TodoItem :id="item.id" :title="item.title" :content="item.content" :isFinished="item.is_finished" :date="item.date" :time="item.time" :style="item.style" :changeFinish="changeTodoItemFinish" :deleteItem="deleteTodoItem" />
          </div>
        </div>
      </div>
    </n-config-provider>
  </n-message-provider>
</template>

<script>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import MainLoading from './components/MainLoading.vue'
import TodoItem from './components/TodoItem.vue'
import { zhCN, dateZhCN } from 'naive-ui'
import {Delete24Regular as DeleteIcon, TaskListRtl24Regular as TaskListIcon, CalendarLtr16Filled as CalendarIcon} from '@vicons/fluent'
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

// ======================================================= 管理todoList的函数
function todoListHandler () {

  let data = []

  const isTodoListDataPrepared = ref(false)
  const addItemFormForTodoListRef = ref(null)
  // 用于添加todolist日程的表单
  const addItemFormForTodoList = reactive({
    title: '',
    content: '',
    datetime: '2022-04-19 22:00',
    style: '#deb887',
    is_finished: 0
  })
  // 添加todolist日程表单的校验规则
  const addItemFormForTodoListRules = {
    title: [
      { required: true, message: '请输入任务标题', trigger: 'blur' }
    ],
    datetime: [
      { required: true, message: '请选择任务时间', trigger: 'blur' }
    ],
    style: [
      { required: true, message: '请选择任务标记', trigger: 'blur' }
    ]
  }

  // 重新挂载数据
  function refreshTodoListData () {
    /* console.log('refreshTodoListData') */
    isTodoListDataPrepared.value = false
    setTimeout(() => {
      isTodoListDataPrepared.value = true
    }, 5)
  }


  // 从数据库获取数据
  const getTodoListFromDB = () => {
    return new Promise((resolve, reject) => {
      DB.all('select * from todolist order by is_finished,date,time', (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // 重新加载todolist
  function reloadTodoList () {
    isTodoListDataPrepared.value = false
    getTodoListFromDB().then(res => {
      data = res
      isTodoListDataPrepared.value = true
    }).catch(e => {
      console.log(e)
    })
  }

  onMounted(() => {
    getTodoListFromDB().then(res => {
      data = res
      setTimeout(() => {
        isTodoListDataPrepared.value = true
      }, 1000)
    }).catch(e => {
      console.log(e)
    })
  })

  // 获取todolist数据
  const getTodoListForTodoList = () => {
    /* console.log(data) */
    return data
  }

  // 改变某个item的状态
  const changeTodoItemFinish = (id, flag) => {
    let str = 'update todolist set is_finished = ' + flag + ' where id = ' + id
    DB.run(str, (err) => {
      if (err) {
        console.log(err)
      } else {
        getTodoListFromDB().then(res => {
          data = res
          refreshTodoListData()
        })
      }
    })
  }

  // 删除某个item
  const deleteTodoItem = (id) => {
    let str = 'delete from todolist where id = ' + id
    DB.run(str, (err) => {
      if (err) {
        console.log(err)
      } else {
        getTodoListFromDB().then(res => {
          data = res
          refreshTodoListData()
        })
      }
    })
  }

  const addItemTodoList = () => {
    console.log(addItemFormForTodoList)
  }

  return {
    isTodoListDataPrepared,
    getTodoListForTodoList,
    changeTodoItemFinish,
    deleteTodoItem,
    refreshTodoListData,
    reloadTodoList,
    addItemFormForTodoListRef,
    addItemFormForTodoList,
    addItemFormForTodoListRules,
    addItemTodoList
  }
}

// ======================================================= 管理日历的函数
function canlendarHandler () {

  let data = []

  const time = Date.now()
  const calendarTime = ref(time)
  const selectedDate = ref('')
  const isCalendarDataPrepared = ref(false)
  const addItemFormForCalendarRef = ref(null)
  // 用于添加日程的表单
  const addItemFormForCalendar = reactive({
    title: '',
    content: '',
    time: '00:00',
    date: '',
    style: '#deb887',
    is_finished: 0
  })
  // 添加日程表单的校验规则
  const addItemFormForCalendarRules = {
    title: [
      { required: true, message: '请输入日程标题', trigger: 'blur' }
    ],
    style: [
      { required: true, message: '请选择日程标记', trigger: 'blur' }
    ]
  }
  const isAddItemFormForCalendarShow = ref(false)

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
    setTimeout(() => {
      isCalendarDataPrepared.value = true
    }, 5)
  }

  // 重新加载日历数据
  function reloadCalendar () {
    isCalendarDataPrepared.value = false
    getTodoListFromDB().then(res => {
      data = res
      isCalendarDataPrepared.value = true
    }).catch(e => {
      console.log(e)
    })
  }

  onMounted(() => {
    getTodoListFromDB().then(res => {
      data = res
      setTimeout(() => {
        isCalendarDataPrepared.value = true
      }, 1000)
    }).catch(e => {
      console.log(e)
    })
  })

  // 获取日历每个单元格的日程
  const getTodoListForCalendar = (year, month, date) => {
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
    /* for (let i = 0; i < data.length; i++) {
      if (JSON.stringify(item) === JSON.stringify(data[i])) {
        data[i].isFinished = flag
        break
      }
    } */
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
    addItemFormForCalendar.date = `${year}-${month}-${date}`
    isAddItemFormForCalendarShow.value = true
  }

  // 添加日程
  const addItemCalendar = () => {
    addItemFormForCalendarRef.value?.validate((errors) => {
      console.log(errors)
      if (!errors) {
        /* console.log('Valid')
        console.log(addItemFormForCalendar) */
        // 校验成功，添加到数据库
        let insertStr = 'insert into todolist (title, content, time, date, style, is_finished) values ("' + addItemFormForCalendar.title + '", "' + addItemFormForCalendar.content + '", "' + addItemFormForCalendar.time + '", "' + addItemFormForCalendar.date + '", "' + addItemFormForCalendar.style + '", ' + addItemFormForCalendar.is_finished + ')'
        DB.run(insertStr, (err) => {
          if (err) {
            console.log(err)
            return
          }
          getTodoListFromDB().then(res => {
            data = res
            // 用于刷新
            refreshCalendarData()
            isAddItemFormForCalendarShow.value = false
            // 重置表单
            addItemFormForCalendar.title = ''
            addItemFormForCalendar.content = ''
            addItemFormForCalendar.time = '00:00'
            addItemFormForCalendar.date = ''
            addItemFormForCalendar.style = '#deb887'
            addItemFormForCalendar.is_finished = 0
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
    getTodoListForCalendar,
    isCalendarDataPrepared,
    changeFinish,
    addItemFormForCalendar,
    isAddItemFormForCalendarShow,
    selectedDate,
    clickCalendarItem,
    addItemCalendar,
    addItemFormForCalendarRules,
    addItemFormForCalendarRef,
    deleteItemCalendar,
    refreshCalendarData,
    reloadCalendar
  }
}

// ======================================================= export default
export default {
  components: {
    MainLoading,
    TodoItem,
    DeleteIcon,
    TaskListIcon,
    CalendarIcon
  },
  setup () {

    /* window.$message = useMessage() */
    
    const loading = ref(true)

    const isCalendarView = ref(true)

    const { calendarTime, getTodoListForCalendar, isCalendarDataPrepared, changeFinish, addItemFormForCalendar, isAddItemFormForCalendarShow, selectedDate, clickCalendarItem, addItemCalendar, addItemFormForCalendarRules, addItemFormForCalendarRef, deleteItemCalendar, reloadCalendar } = canlendarHandler()

    const { zhCN, dateZhCN } = configHandler()

    const { isTodoListDataPrepared, getTodoListForTodoList, changeTodoItemFinish, deleteTodoItem, reloadTodoList, addItemFormForTodoListRef, addItemFormForTodoList, addItemFormForTodoListRules, addItemTodoList } = todoListHandler()

    DB = new sqlite3.Database(databaseUrl, (err) => {
      if (err) {
        console.error(err)
      }
      else{
        // 成功之后关闭加载界面
        setTimeout(() => {
          loading.value = false
        }, 1000)
      }
    })

    watch(isCalendarView, (newVal) => {
      console.log(newVal)
      // 为 true 证明回到日历视图
      if (newVal) {
        /* console.log('刷新日历') */
        reloadCalendar()
      } else {
        /* console.log('刷新todolist') */
        reloadTodoList ()
      }
    })

    onUnmounted(() => {
      DB.close()
    })

    return {
      // setup
      loading,
      isCalendarView,
      // calendarHandler
      calendarTime,
      getTodoListForCalendar,
      changeFinish,
      isCalendarDataPrepared,
      addItemCalendar,
      deleteItemCalendar,
      addItemFormForCalendar,
      isAddItemFormForCalendarShow,
      selectedDate,
      clickCalendarItem,
      addItemFormForCalendarRules,
      addItemFormForCalendarRef,
      // todoListHandler
      isTodoListDataPrepared,
      getTodoListForTodoList,
      changeTodoItemFinish,
      deleteTodoItem,
      addItemFormForTodoList,
      addItemFormForTodoListRef,
      addItemFormForTodoListRules,
      addItemTodoList,
      // globalConfig
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
  #todolist {
    display: flex;
    justify-content: space-around;
    width: 90%;
    margin: auto;
    padding: 10px 0;
  }
  #todolist > div {
    width: 45%;
  }
  ::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 3px;  /*高宽分别对应横竖滚动条的尺寸*/
    height: 1px;
  }
  ::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 10px;
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
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #ffffff;
    border-radius: 10px;
  }
</style>
