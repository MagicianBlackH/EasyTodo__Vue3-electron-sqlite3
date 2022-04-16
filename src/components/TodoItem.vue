<template>
    <div>
        <n-card :embedded="props.isFinished" hoverable :title="props.title" :class="!props.isFinished ? 'deepBackground' : ''">
            <template #header-extra>
                <n-checkbox size="large" v-model:checked="isFinishedCheck" />
            </template>
            <span :style="'background:' + props.style">&ensp;</span>&ensp;{{props.content}}
            <template #footer>
                {{props.date}}&ensp;{{props.time}}
            </template>
        </n-card>
    </div>
</template>

<script>
import { watch, ref } from 'vue'
export default {
    props: {
        date: {
            type: String,
            require: true
        },
        time: {
            type: String,
            require: true
        },
        title: {
            type: String,
            require: true
        },
        content: {
            type: String,
            require: true
        },
        isFinished: {
            type: Boolean,
            require: true
        },
        style: {
            type: String,
            require: true
        },
        /* changeFinish: {
            type: Function,
            require: true
        } */
    },
    setup(props) {
        const isFinishedCheck = ref(props.isFinished)

        watch(isFinishedCheck, (newVal) => {
            console.log(newVal)
            // TODO: 改变完成状态
        })
        return {
            props,
            isFinishedCheck
        }
    },
}
</script>

<style scoped>
    .deepBackground {
        background-color: #fafafa !important;
    }
</style>