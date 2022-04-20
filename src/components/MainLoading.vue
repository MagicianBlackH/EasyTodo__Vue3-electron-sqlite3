<template>
    <div id="mainContainer">
        <img :src="require('@/assets/logo.png')" width="752" height="372">
        <h1>EasyTodo</h1>
        <a-spin size="large" />
        <div id="footer">
            <span>Copyright&nbsp;©&nbsp;2022&nbsp;HPC,&nbsp;All&nbsp;Rights&nbsp;Reserved.</span>
            <br>
            <span>UI-lib:&nbsp;Ant&nbsp;Desigin&nbsp;Vue,&nbsp;&nbsp;Naive-ui</span>
        </div>
    </div>
</template>

<script>
// import { defineComponent } from 'vue'
import { Spin } from 'ant-design-vue'

export default {
  components: {
    ASpin: Spin
  }
}
</script>

<style scoped>
    #mainContainer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 5;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: white;
    }
    #footer {
        text-align: center;
        position: absolute;
        bottom: 20px;
    }
</style>
