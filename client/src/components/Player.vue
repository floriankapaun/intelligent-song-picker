<template>
    <div>
        <img :src="selfie" :class="selfie ? null : 'hidden'" alt="your selfie">
        <button @click="$emit('deleteSelfie')">New selfie</button>
    </div>
</template>

<script>
export default {
    props: {
        selfie: undefined,
    },
};
</script>