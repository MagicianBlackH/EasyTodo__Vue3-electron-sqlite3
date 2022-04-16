<template>
    <div>
        <n-card :embedded="isFinished === 1" hoverable :title="title">
            <template #header-extra>
                <n-checkbox size="large" :checked="isFinished" />
            </template>
            {{content}}
            <template #footer>
                {{date}}&ensp;{{time}}
            </template>
        </n-card>
    </div>
</template>

<script>
import { watch } from 'vue'
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
        watch(() => props.isFinished, (newVal) => {
            console.log(newVal)
        })
    },
}
</script>

<style scoped>

</style>