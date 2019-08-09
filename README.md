# HARGITA 2019

## Plain Text Database

Formatting tags used:

- [verse#]
- [chorus#]
- [pre#]
- [bridge#]
- [end]

Structure:

```
[tag1]
line1
line2
...
lineN

line21
line22
...
lineM

[tag2]
```

Derived JSON structure:

```typescript
songs: [
  {
    title: string,
    parts: [
      {
        tag: string,
        slides: [string]
      }
    ]
  }
]
```