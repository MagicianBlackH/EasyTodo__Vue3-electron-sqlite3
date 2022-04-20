<template>
    <div style="margin: 5px 0">
        <n-card hoverable :title="props.title" :class="!isFinishedCheck ? 'deepBackground' : 'todoBackground'">
            <template #header-extra>
                <n-checkbox size="large" v-model:checked="isFinishedCheck" @click="onCheckboxClick" />
            </template>

            <div v-if="!isFinishedCheck">
                <span :style="'background:' + props.style">&ensp;</span>&ensp;{{props.content}}
            </div>
            <div v-else>
                <span :style="'background: grey'">&ensp;</span>&ensp;<del>{{props.content}}</del>
            </div>
            
            <template #footer>
                <div style="display: flex; justify-content: space-between">
                    <span>
                        {{props.date}}&ensp;{{props.time}}
                    </span>
                    <n-button quaternary circle type="error" @click="props.deleteItem(props.id)">
                        <template #icon>
                            <n-icon><delete-icon /></n-icon>
                        </template>
                    </n-button>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script>
import { watch, ref } from 'vue'
import {Delete24Regular as DeleteIcon} from '@vicons/fluent'
export default {
    components: {
        DeleteIcon
    },
    props: {
        id: {
            type: Number,
            required: true
        },
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
            type: Number,
            require: true
        },
        style: {
            type: String,
            require: true
        },
        changeFinish: {
            type: Function,
            require: true
        },
        deleteItem: {
            type: Function,
            require: true
        }
    },
    setup(props) {
        const isFinishedCheck = ref(true)
        /* console.log(props) */
        props.isFinished === 1 ? isFinishedCheck.value = true : isFinishedCheck.value = false
        watch(() => props.isFinished, (newVal) => {
            /* console.log('watch', newVal) */
            newVal === 1 ? isFinishedCheck.value = true : isFinishedCheck.value = false
        })

        const onCheckboxClick = () => {
            /* console.log('点击了checkbox', isFinishedCheck.value) */
            props.changeFinish(props.id, isFinishedCheck.value ? 1 : 0)
        }

        return {
            props,
            isFinishedCheck,
            onCheckboxClick
        }
    },
}
</script>

<style scoped>
    .finishedBackground {
        background-color: #fcfcfc !important;
    }
    .todoBackground {
        background-color: #aaaaaa !important;
    }
</style>