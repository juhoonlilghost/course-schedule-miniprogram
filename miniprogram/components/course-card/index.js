Component({
  properties: {
    course: {
      type: Object,
      value: {}
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.properties.course._id });
    }
  }
});
